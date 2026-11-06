# ricursiveAI/Ripple-65B-Preview-DFlash2

## Resumen

Ripple-65B Preview DFlash2 es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa junto al modelo objetivo Ripple-65B Preview, desarrollado por Ricursive Intelligence. No es un modelo generativo autonomo: propone bloques de tokens candidatos que el modelo objetivo verifica, acelerando la inferencia sin alterar la distribucion de muestreo del modelo principal cuando se implementa correctamente el rechazo especulativo.

El checkpoint contiene 4.037.752.064 parametros en BF16, organizados en una arquitectura `DFlash2DraftModel` de cinco capas con atencion deslizante de 4.096 tokens y una capa final de atencion completa sin embeddings posicionales rotatorios (NoPE). Combina tecnicas de drafting paralelo por bloques, convoluciones dinamicas y un selector de candidatos top-32 con rango 256.

Su relevancia actual reside en que la decodificacion especulativa se ha consolidado como una de las vias practicas para reducir la latencia en modelos de gran tamano sin degradar la calidad. Este borrador esta disenado para el modelo Ripple-65B, que no se distribuye en este repositorio, por lo que su utilidad depende de disponer de dicho modelo objetivo y de un runtime compatible (SGLang con soporte DFLASH).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DFlash2DraftModel` (transformer con atencion deslizante + NoPE) |
| Parametros totales | 4.037.752.064 (4,04B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 posiciones configuradas; ventana deslizante de 4.096 tokens |
| Tipos de cuantizacion | BF16 (checkpoint); el autor referencia un unquant en SGLang |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

DFlash2 es un modelo borrador especializado en decodificacion especulativa. Consta de cinco capas con tamano oculto 5.120, 80 cabezas de consulta y 8 cabezas KV, dimension de cabeza 128 y MLP SwiGLU con tamano intermedio 40.960. Las cuatro primeras capas usan atencion deslizante con ventana de 4.096 tokens y RoPE con theta 10.000; la quinta capa (indice 4, base cero) emplea atencion completa sin RoPE (NoPE), lo que le permite atender mas alla de la ventana deslizante. El vocabulario es de 100.352 tokens, compartido con el modelo objetivo.

El borrador se condiciona a estados ocultos intermedios del modelo objetivo en las capas 1, 20, 39, 58 y 77 (base cero) de un target de 80 capas. Genera bloques de 16 tokens, retiene 32 candidatos por posicion y usa un selector de rango 256. Incorpora convoluciones dinamicas con tamano de kernel 4 y tamano de grupo 16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La validacion registrada del export se realizo con el runtime `ripple-sglang` sobre ocho GPU H100 y el checkpoint objetivo en el paso de RL 500.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa: produce bloques de 16 tokens candidatos que el modelo objetivo verifica.
- Condicionamiento sobre estados ocultos intermedios del modelo objetivo Ripple-65B.
- Selector de candidatos top-32 para filtrar propuestas antes de la verificacion.
- No genera texto de forma autonoma: requiere el modelo objetivo para producir salida final.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible (no aplica a un draft model).
- Capacidades multilingues: no disponibles; dependen del modelo objetivo y del tokenizador compartido.

## Casos de uso

- Aceleracion de inferencia en produccion con Ripple-65B: el borrador propone bloques de 16 tokens que el objetivo verifica, reduciendo el numero de pasos de decodificacion efectivos. Adecuado para despliegues con requisitos de latencia estrictos.
- Servicio de chat de baja latencia: al reducir el coste por token generado, permite mantener conversaciones multi-turno con ventanas largas (hasta 131.072 posiciones configuradas) sin degradar la distribucion de muestreo.
- Generacion de codigo en pipelines interactivos: la decodificacion especulativa reduce el tiempo hasta el primer token util en asistentes de codigo que dependen de un modelo grande.
- Despliegue en clústeres con GPU H100: el autor valida el borrador sobre ocho H100 con el runtime `ripple-sglang`, un escenario tipico de serving a gran escala.
- Investigacion en decodificacion especulativa: sirve como referencia de implementacion de drafting paralelo por bloques, convoluciones dinamicas y selectores de candidatos.
- Evaluacion comparativa de tecnicas de aceleracion: permite medir el impacto de DFlash2 frente a otros esquemas de drafting sobre el mismo modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona una validacion de compatibilidad con `ripple-sglang` en ocho H100 usando el checkpoint objetivo en el paso de RL 500, sin cifras de throughput ni de aceptacion de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,1 GB en BF16 para el borrador (tamano del repo); debe sumarse la memoria del modelo objetivo Ripple-65B.
- GPU recomendadas: H100 (validado por el autor en configuracion de ocho unidades); A100 como alternativa plausible segun memoria disponible, aunque no validada.
- Cabe en GPU consumer: el borrador por si solo si (8,1 GB), pero el modelo objetivo de 65B no cabe en GPU consumer sin cuantizacion o descarga a CPU.
- Opciones de despliegue: SGLang con soporte DFLASH (`--speculative-algorithm DFLASH`, `--speculative-draft-model-path`, `--speculative-draft-model-quantization unquant`, `--speculative-num-draft-tokens 16`). No se documentan soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros borradores de decodificacion especulativa comparables (por ejemplo, drafters de EAGLE o Medusa) en la informacion disponible, ni cifras de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo Ripple-65B Preview o su variante NVFP4 para generar texto.
- La validacion registrada solo cubre el runtime `ripple-sglang`, ocho H100 y el checkpoint objetivo en el paso de RL 500; no se garantiza compatibilidad ni rendimiento con otras revisiones del objetivo o versiones del runtime.
- El repositorio no incluye el embedding de tokens compartido ni la cabeza de salida del modelo objetivo; deben tomarse del target.
- El runtime debe soportar el patron de atencion por capas, la capa NoPE, las convoluciones de cuatro tomas y los taps de estados ocultos del objetivo.
- Sesgos, riesgo de alucinacion y limitaciones idiomaticas: no disponibles de forma independiente; heredados del modelo objetivo.
- Licencia Apache 2.0 permite uso comercial, pero el uso practico queda condicionado por la disponibilidad y licencia del modelo objetivo.
- Sin descargas ni likes registrados en el momento de la consulta; ecosistema de herramientas limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Modelo objetivo BF16: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Modelo objetivo NVFP4: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Sitio web del autor: https://www.ricursive.com
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
