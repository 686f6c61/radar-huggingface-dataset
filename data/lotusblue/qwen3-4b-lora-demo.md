# lotusblue/qwen3-4b-lora-demo

## Resumen

`lotusblue/qwen3-4b-lora-demo` es un adaptador LoRA (PEFT) publicado por el usuario `lotusblue` sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Se trata de un ajuste fino supervisado (SFT) realizado con LLaMA-Factory sobre los conjuntos de datos `identity` y `alpaca_en_demo`, y no de un modelo completo entrenado desde cero. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que solo contiene los pesos del adaptador y no los del modelo base.

Por su naturaleza, no es un modelo pensado para uso general en producción, sino una demostración técnica del flujo de entrenamiento LoRA con LLaMA-Factory sobre la familia Qwen3. El modelo base Qwen3-4B-Instruct-2507 aporta la arquitectura y las capacidades subyacentes (generación de texto, razonamiento, contexto largo), mientras que el adaptador modifica el comportamiento en la dirección definida por los datasets de ajuste.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo real de adaptación de un modelo Qwen3 de 4B parámetros mediante LoRA; por otro, sirve como referencia para entender qué información publica (y qué no) un adaptador de este tipo, ya que la model card es en gran medida una plantilla autogenerada con secciones sin completar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen3-4B-Instruct-2507) |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base Qwen3-4B tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente los pesos de un adaptador LoRA entrenado con PEFT 0.18.1 y LLaMA-Factory sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Al ser un adaptador, la arquitectura efectiva es la del modelo base (transformer decoder-only de la familia Qwen3 con 4B parámetros), a la que se superponen las matrices de bajo rango del LoRA. No se especifica el rango, el alpha ni los módulos objetivo del adaptador en la información disponible.

El entrenamiento se realizó durante 3 épocas con un learning rate de 1e-4, optimizador AdamW torch fused (betas 0,9 y 0,999, epsilon 1e-8), scheduler coseno con warmup del 10 % de los pasos, batch size efectivo de 8 (batch 1 con 8 pasos de acumulación de gradiente), batch de evaluación de 8 y semilla 42. Los datos de entrenamiento declarados son los conjuntos `identity` y `alpaca_en_demo`. No se documenta el número de tokens, la composición detallada del dataset ni si hubo etapas de RLHF o DPO posteriores al SFT. Las versiones de framework indicadas son Transformers 5.17.0, PyTorch 2.14.1+cu130, Datasets 4.0.0 y Tokenizers 0.23.3.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-4B-Instruct-2507.
- Ajuste orientado a identidad y a instrucciones generales en inglés, según los datasets `identity` y `alpaca_en_demo`.
- Razonamiento y matemáticas básicas: capacidad potencialmente presente por el modelo base, aunque no verificada ni documentada para este adaptador.
- Generación de código: no documentada específicamente para el adaptador.
- Tool calling / function calling: no documentado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (los idiomas no están declarados).
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Demostración de flujo LoRA con LLaMA-Factory: el adaptador sirve como ejemplo reproducible de ajuste fino supervisado sobre Qwen3-4B, útil para equipos que quieran validar su pipeline de entrenamiento antes de escalar a datasets propios.
- Personalización de identidad del asistente: al haberse entrenado con el dataset `identity`, el adaptador puede emplearse para experimentar con la persona o el tono del modelo en prototipos de asistentes conversacionales.
- Ajuste de instrucciones en inglés: el dataset `alpaca_en_demo` permite probar cómo responde el modelo base tras un SFT ligero en tareas de seguimiento de instrucciones en inglés.
- Base para experimentos de investigación en PEFT: útil para comparar el efecto de distintas configuraciones de LoRA (rango, alpha, épocas) sobre un mismo modelo base.
- Evaluación de técnicas de fusión de adaptadores: el adaptador puede fusionarse con el modelo base para estudiar el impacto en calidad y latencia frente a la inferencia con adaptador separado.
- Prototipado rápido de chatbots internos: para pruebas de concepto donde no se requiere garantía de calidad ni soporte multilingüe, el adaptador permite iterar sobre el comportamiento conversacional sin reentrenar el modelo completo.

## Benchmarks y rendimiento

La model card declara un `model-index` con la entrada `sft` y una lista de resultados vacía. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base Qwen3-4B-Instruct-2507 y de su cuantización.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no documentada; el adaptador en sí ocupa ~0,1 GB, pero requiere cargar el modelo base completo.
- Opciones de despliegue: PEFT + Transformers (según la librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lotusblue/qwen3-4b-lora-demo | Adaptador LoRA sobre Qwen3-4B-Instruct-2507 | No declarado (base 4B) | No disponible | other | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 | Modelo completo | 4B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face |
| Otros adaptadores LoRA sobre Qwen3-4B | Adaptador PEFT | No declarado | Heredado del base | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada con secciones marcadas como "More information needed": no hay descripción del modelo, usos previstos, limitaciones ni datos de evaluación.
- No se declaran los idiomas soportados, lo que impide garantizar un comportamiento correcto fuera del inglés de los datasets de entrenamiento.
- El adaptador se ha entrenado sobre `alpaca_en_demo`, un conjunto de demostración, por lo que la calidad del ajuste es limitada y no representa un SFT robusto.
- No hay resultados de benchmarks publicados; no es posible evaluar la mejora o degradación respecto al modelo base.
- Riesgo de alucinación inherente al modelo base Qwen3-4B, no mitigado ni documentado en el adaptador.
- Sesgos conocidos: no documentados, pero potencialmente heredados del modelo base y de los datasets de ajuste.
- Licencia "other": es necesario revisar los términos exactos antes de cualquier uso comercial; la licencia del adaptador puede estar sujeta además a las condiciones del modelo base.
- No se especifican el rango, alpha ni módulos objetivo del LoRA, lo que dificulta la reproducibilidad del entrenamiento.
- El repositorio no incluye el modelo base; para usarlo es necesario descargar Qwen/Qwen3-4B-Instruct-2507 por separado.

## Enlaces

- Hugging Face: https://huggingface.co/lotusblue/qwen3-4b-lora-demo
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- LLaMA-Factory (framework de entrenamiento citado): no se proporciona enlace en la informacion disponible
- PEFT (librería declarada): no se proporciona enlace en la informacion disponible
