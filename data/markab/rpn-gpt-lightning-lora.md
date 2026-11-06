# markab/rpn-gpt-lightning-LoRA

## Resumen

rpn-gpt-lightning-LoRA es un adaptador LoRA desarrollado por el usuario markab sobre el modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16. Su proposito es ensenar al modelo a delegar los calculos exactos en una maquina Forth (una calculadora de pila RPN) cuando el problema lo requiere, y a responder directamente cuando no es necesario. El adaptador no ejecuta la maquina: solo genera el codigo Forth, que despues se ejecuta en un bucle externo o en un kernel integrado en los propios pesos.

El adaptador tiene un rango LoRA de 16, alpha 32 y ocupa aproximadamente 23 MB, lo que permite intercambiarlo en caliente sobre un servidor vLLM que ya sirva el modelo base en BF16. La motivacion es reducir los errores de aritmetica exacta en modelos de lenguaje: en lugar de forzar al modelo a calcular mentalmente, se le entrena para emitir instrucciones en un lenguaje determinista y verificable.

La relevancia actual radica en el enfoque hibrido: el modelo conserva su capacidad general (MATH-500 sin maquina alcanza 97,8 %) y ademas mejora sustancialmente en problemas aritmeticos exactos (del 79,1 % al 92,1 % en el conjunto de test congelado). El adaptador esta pensado para entornos de investigacion y despliegue con vLLM, y su licencia MIT facilita su reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE (modelo base Nemotron 3.5 Lightning) |
| Parametros totales | no disponible (adaptador de ~23 MB; el base tiene 30B) |
| Parametros activos | no disponible (el base es 30B-A3B, 3B activos) |
| Longitud de contexto | 65.536 tokens (configuracion de despliegue indicada en la model card) |
| Tipos de cuantizacion | no disponible para el adaptador; el base admite BF16 y NVFP4 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 sobre el modelo NVIDIA Nemotron 3.5 Lightning 30B-A3B, un transformer con arquitectura Mixture-of-Experts. El entrenamiento se realizo sobre el dataset markab/rpn-gpt-data, que incluye conjuntos especificos para evaluacion: frozen_test, dev_round y dev_codefull. La innovacion principal es el entrenamiento para emitir bloques de codigo Forth delimitados por ```forth, que un interprete externo ejecuta y devuelve en bloques ```output. Ademas, el autor menciona una variante en la que un kernel integrado en los propios pesos del modelo ejecuta la maquina Forth de forma interna, con tokens ocultos reservados que decodifican a cadena vacia.

No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor publica la especificacion del kernel en kernel/text_vm.py y el codigo de entrenamiento en el repositorio de GitHub.

## Capacidades

- Generacion de codigo Forth para calculo exacto con maquina de pila RPN.
- Razonamiento aritmetico exacto cuando se le proporciona la maquina externa o el kernel integrado.
- Respuesta directa sin maquina cuando el problema no requiere computo exacto (capacidad heredada del base).
- Generacion de texto general y matematicas (MATH-500 sin maquina: 97,8 %).
- Soporte de modo thinking con presupuesto de tokens configurable (12000 tokens de pensamiento, 24000 de turno en las evaluaciones).
- Capacidad multilingue limitada al ingles segun la model card.
- No se documenta soporte explicito de tool calling generico, agentes multi-paso ni vision en la informacion disponible.

## Casos de uso

- Verificacion aritmetica exacta en produccion: el modelo emite codigo Forth que se ejecuta en un interprete determinista, eliminando errores de redondeo en calculos financieros o cientificos. Es adecuado porque el resultado es verificable y reproducible.
- Evaluacion de modelos con maquina externa: el script rpn_chat.py permite conectar el adaptador a cualquier servidor compatible y ejecutar los bloques Forth generados, util para comparar el comportamiento con y sin maquina.
- Investigacion en neurosimbolismo: el adaptador sirve como caso de estudio de como un LLM aprende a delegar en un lenguaje formal determinista, con metricas publicadas y codigo abierto.
- Despliegue con intercambio en caliente: al ser un LoRA de ~23 MB, se puede cargar sobre un servidor vLLM con el base BF16 ya servido, sin duplicar el modelo en memoria.
- Generacion de problemas y soluciones de aritmetica exacta: el modelo puede producir pares problema-solucion con el codigo Forth intermedio, util para aumentar datasets de entrenamiento.
- Prototipado de kernels integrados: el autor documenta una variante donde el kernel Forth vive en los pesos del modelo, lo que permite experimentar con ejecucion interna sin bucle externo.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Conjunto | Problemas x muestras | Stock Lightning | Este adaptador | Delta [IC 95 %] |
|---|---|---|---|---|
| Frozen test | 600 x2 | 79,1 % | 92,1 % | +13,0 [+10,2, +15,8] |
| Frozen test, problemas dificiles | 194 x2 | 69,1 % | 89,7 % | +20,6 |
| Dev set | 407 x4 | no disponible | 93,1 % | +1,2 [-0,1, +2,6] vs ronda 5 |
| Code-heavy dev set | 200 x2 | no disponible | 83,0 % | +5,0 [-0,2, +10,2] vs ronda 5 |
| MATH-500, sin maquina | 500 x2 | 97,1 % | 97,8 % | +0,7 [+0,0, +1,4] |

Ajustes: maquina externa, card v4, presupuesto de pensamiento de 12000 tokens, limite de turno de 24000 tokens, temperatura 1,0, top-p 0,95. En base NVFP4 el adaptador obtiene 87,5 % en el frozen test x1 frente a 91,7 % en BF16 (-4,2 [-7,0, -1,3]).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; requiere cargar el modelo base Nemotron 3.5 Lightning 30B-A3B en BF16 o NVFP4.
- GPU recomendadas: no especificadas en la informacion; el despliegue documentado usa vLLM con --enable-lora.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: vLLM con --enable-lora --max-lora-rank 16; el autor menciona versiones GGUF (Ollama, llama.cpp), NVFP4 y MLX en el modelo fusionado rpn-gpt-lightning.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rpn-gpt-lightning-LoRA | LoRA sobre 30B-A3B | 65.536 | 92,1 % frozen test; 97,8 % MATH-500 | MIT | Hugging Face |
| rpn-gpt-lightning (fusionado) | 30B-A3B | 65.536 | Mismo adaptador fusionado; incluye GGUF, NVFP4, MLX | MIT | Hugging Face |
| rpn-gpt-lightning-NVFP4 | 30B-A3B en NVFP4 | 65.536 | 90,5 % frozen test x1 (-1,2 vs BF16) | MIT | Hugging Face |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B (stock) | 30B-A3B | no disponible | 79,1 % frozen test; 97,1 % MATH-500 | no disponible | Hugging Face (NVIDIA) |

## Limitaciones y advertencias

- El adaptador solo genera el codigo Forth; la ejecucion requiere un interprete externo o el kernel integrado. Sin maquina, la mejora en aritmetica exacta no se materializa.
- Requiere el system prompt especifico (reference_v4.txt) y los ajustes de muestreo indicados (temperatura 1,0, top-p 0,95); desviarse puede degradar el rendimiento.
- Idioma limitado al ingles segun la model card.
- Los resultados son declarados por el autor y no han sido verificados de forma independiente (verified: false en el model-index).
- En base NVFP4 el adaptador pierde rendimiento (-4,2 puntos frente a BF16); el autor recomienda la version NVFP4 especifica para ese caso.
- Riesgo de alucinacion en la generacion de codigo Forth: si el codigo es incorrecto, el interprete producira un resultado erroneo que el modelo puede presentar como valido.
- No se documentan sesgos especificos ni restricciones adicionales de la licencia MIT para uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/markab/rpn-gpt-lightning-LoRA
- Modelo fusionado: https://huggingface.co/markab/rpn-gpt-lightning
- Version NVFP4: https://huggingface.co/markab/rpn-gpt-lightning-NVFP4
- Version con kernel en pesos: https://huggingface.co/markab/rpn-gpt-lightning-Forth
- Repositorio GitHub: https://github.com/markab21/rpn-gpt
- Dataset: https://huggingface.co/datasets/markab/rpn-gpt-data
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Ejemplo de turno completo: https://huggingface.co/markab/rpn-gpt-lightning/blob/main/example_r7_in_weights.md
- Guia de agentes: https://github.com/markab21/rpn-gpt/blob/main/AGENT.md
- Script de chat: https://github.com/markab21/rpn-gpt/blob/main/rpn_chat.py
