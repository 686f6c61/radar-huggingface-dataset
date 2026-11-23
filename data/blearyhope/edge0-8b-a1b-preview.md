# blearyhope/Edge0-8B-A1B-preview

## Resumen

Edge0-8B-A1B-preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso de aproximadamente 7.924 millones de parametros totales y unos 1.200 millones de parametros activos por token, desarrollado por el autor blearyhope sobre el modelo base inclusionAI/Ling-3.0-tiny-base. Su propuesta central no es competir en capacidad bruta, sino demostrar que un modelo de clase 8B puede ejecutarse de forma interactiva en memoria propia de un telefono movil mediante el framework de inferencia en streaming edge0, que mantiene el checkpoint cuantizado a 4 bits en almacenamiento y transmite los expertos bajo demanda.

El modelo se distribuye como un checkpoint int4 congelado acompanado de adaptadores LoRA y un cabezal prerouter entrenados especificamente para este framework. La combinacion de offload de expertos a SSD, un prerouter que predice el enrutamiento con un paso de antelacion y una destilacion Recover-LoRA desde el profesor en FP permite, segun el autor, mantener la calidad dentro de 2,8 puntos del modelo base en fp16 y alcanzar 25 tok/s de decodificacion con menos de 1 GiB de memoria activa.

Es relevante ahora porque traslada el paradigma de los modelos MoE de gran escala al extremo opuesto del espectro: inferencia nativa en iOS, macOS, Android y Windows con un unico directorio de modelo. Para desarrolladores que evaluan despliegue en dispositivo, la ficha debe leerse con cautela: se trata de una preview temprana, con cero descargas y cero likes en el momento de la consulta, y con la mayor parte de las metricas de calidad sin publicar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido tipo bailing (MLA + MoE), 24 capas, hidden size 1536 |
| Parametros totales | 7.923.998.112 (≈7,9B) |
| Parametros activos | ≈1,2B por token (8 expertos activos de 128, K=8) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | 4-bit (checkpoint distribuido ya cuantizado); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint base int4 + `lora_edge0_8b.safetensors` + adaptador prerouter); libreria MLX |
| Framework de inferencia | edge0 (backend MLX) |
| Modo thinking | si, via chat template |
| Tamano del repositorio | 4,6 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base inclusionAI/Ling-3.0-tiny-base, descrita por el autor como un transformer MoE hibrido con atencion MLA (Multi-head Latent Attention) y 24 capas, 128 expertos en total y 8 activos por token. El checkpoint publicado no es el modelo original en precision completa, sino una version cuantizada a 4 bits sobre la que se anaden dos componentes entrenados: adaptadores LoRA y un cabezal prerouter.

El entrenamiento de los adaptadores sigue un esquema de destilacion denominado Recover-LoRA: la base int4 permanece congelada y los adaptadores se entrenan por destilacion desde el profesor en FP, de modo que recuperan la mayor parte de la perdida por cuantizacion. Los adaptadores no se fusionan con la base, lo que permite que un unico checkpoint de solo lectura sirva a varios conjuntos de adaptadores. El prerouter es un cabezal entrenado que predice el enrutamiento de expertos con un paso de antelacion, de forma que las cargas desde SSD se solapan con el forward pass en lugar de bloquearlo; el autor reporta hasta un 59% de mejora en throughput de decodificacion, con ganancias crecientes segun la latencia del almacenamiento, el tamano del modelo y el ancho enrutado K. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo thinking activable mediante el chat template.
- Enrutamiento MoE disperso con 8 expertos activos por token sobre 128 totales.
- Inferencia en streaming con offload de expertos a SSD: la memoria pico queda acotada por el conjunto activo, no por el numero de parametros.
- Prediccion anticipada de enrutamiento mediante prerouter para solapar cargas de expertos con el calculo.
- Ejecucion nativa en cuatro plataformas (iOS, macOS, Android, Windows) con el mismo directorio de modelo.
- Contexto largo de hasta 128k tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales en aplicacion movil: el modelo cabe en menos de 1 GiB de memoria activa y decodifica a 25 tok/s, por lo que puede integrarse en apps iOS y Android con motores nativos sin depender de la nube ni de conectividad constante.
- Procesamiento de documentos largos en dispositivo: con 128k tokens de contexto y un llenado de prompt de 1400 tok/s, es adecuado para resumir contratos, informes o expedientes localmente, manteniendo los datos en el terminal.
- Copilotos de escritorio en Windows y macOS: el mismo directorio de modelo se ejecuta con los motores nativos de edge0, lo que simplifica el empaquetado de una unica distribucion para portatil y sobremesa.
- Escenarios con requisitos estrictos de privacidad: al no requerir envio de datos a servidores externos, encaja en entornos sanitarios, legales o corporativos donde el texto no puede salir del dispositivo.
- Prototipado de agentes con contexto largo: los 128k tokens permiten mantener historiales extensos y documentos de referencia en la ventana, util para pruebas de razonamiento multi-paso antes de escalar a modelos mayores.
- Evaluacion de infraestructura de inferencia en el borde: sirve como banco de pruebas para medir el impacto del offload a SSD y del prerouter en funcion de la latencia de almacenamiento del dispositivo objetivo.
- Despliegue en hardware con VRAM limitada: al mantener solo los pesos activos en RAM, permite servir un modelo de clase 8B en equipos donde cargar los 4,6 GB del checkpoint completo en memoria seria inviable.

## Benchmarks y rendimiento

El autor publica metricas de rendimiento de inferencia y una comparacion agregada de calidad, pero no detalla resultados por benchmark individual. Los datos disponibles son los siguientes:

| Metrica | Valor reportado |
|---|---|
| Memoria activa (int4, offload a SSD) | < 1 GiB |
| Velocidad de decodificacion | 25 tok/s |
| Velocidad de llenado de prompt | 1400 tok/s |
| Brecha de calidad frente al base fp16 | dentro de 2,8 puntos (y por encima en MMLU-Pro) |
| Mejora de throughput por prerouter | hasta +59% en decodificacion |

No se han publicado resultados numericos desglosados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: menos de 1 GiB de memoria activa con el checkpoint int4 y offload de expertos a SSD; el checkpoint completo ocupa 4,6 GB en almacenamiento.
- Almacenamiento: se recomienda SSD, ya que el rendimiento depende directamente de la latencia de lectura; el autor senala que la ganancia del prerouter crece con la latencia del almacenamiento.
- GPU recomendadas: no disponibles. El framework edge0 usa backend MLX, lo que vincula la ejecucion a silicio Apple en macOS e iOS; los motores para Android y Windows se distribuyen en el repositorio, pero no se detallan los aceleradores soportados.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; el objetivo declarado es memoria de clase telefonica, no tarjetas dedicadas.
- Opciones de despliegue: framework edge0 con motores nativos para iOS, macOS, Android y Windows. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 25 tok/s en decodificacion y 1400 tok/s en llenado de prompt, medidos por el autor; no se especifica el dispositivo de referencia.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Edge0-8B-A1B-preview | ≈7,9B / ≈1,2B | 128k | Apache 2.0 | Hugging Face, ModelScope, GitHub |
| inclusionAI/Ling-3.0-tiny-base | ≈7,9B / ≈1,2B | no disponible | no disponible | Hugging Face (modelo base) |
| Edge0-35B-A3B-preview | ≈35B / ≈3B (segun denominacion) | no disponible | Apache 2.0 | Hugging Face, ModelScope |

La comparacion con modelos de la misma categoria fuera de la familia Edge0 no esta disponible en la informacion proporcionada. El competidor natural es el propio modelo base Ling-3.0-tiny, del que este checkpoint deriva y frente al cual el autor declara una brecha de calidad de 2,8 puntos con la ventaja de ejecutarse en menos de 1 GiB de memoria activa.

## Limitaciones y advertencias

- Estado de preview temprana: el propio autor lo califica como lanzamiento inicial del pipeline edge0; no debe tratarse como version estable para produccion.
- Ausencia de validacion externa: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks desglosados que permitan verificar las afirmaciones de calidad.
- Dependencia del framework: el checkpoint esta disenado para edge0 con backend MLX; no hay evidencia de compatibilidad con vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad.
- Dependencia del almacenamiento: el rendimiento depende de la latencia del SSD; en almacenamiento lento la decodificacion puede degradarse pese al prerouter.
- Idiomas soportados no documentados: no puede garantizarse un rendimiento adecuado en castellano ni en otros idiomas sin evaluacion previa.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no se han publicado evaluaciones de factualidad.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Tool calling y comportamiento agentico: no confirmados; conviene validarlos antes de disenar flujos que dependan de ellos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Ling-3.0-tiny tiene una licencia no especificada en la informacion disponible, lo que conviene verificar antes de explotar comercialmente el derivado.
- Cuantizacion fija a 4 bits: no se ofrecen variantes en otros niveles de precision, lo que limita el ajuste fino del equilibrio calidad/memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blearyhope/Edge0-8B-A1B-preview
- Repositorio del framework edge0: https://github.com/Edge0-AI/edge0
- Motor iOS: https://github.com/Edge0-AI/edge0/tree/main/ios
- Motor macOS: https://github.com/Edge0-AI/edge0/tree/main/macos
- Motor Android: https://github.com/Edge0-AI/edge0/tree/main/android
- Motor Windows: https://github.com/Edge0-AI/edge0/tree/main/windows
- Licencia: https://github.com/Edge0-AI/edge0/blob/main/LICENSE
- Paper: https://arxiv.org/abs/2609.18063
- Modelo hermano Edge0-35B-A3B-preview: https://huggingface.co/Edge0/Edge0-35b-a3b-preview
- Edge0-8B-A1B-preview en ModelScope: https://www.modelscope.cn/models/Edge0/Edge0-8B-A1B-preview
- Edge0-35B-A3B-preview en ModelScope: https://www.modelscope.cn/models/Edge0/Edge0-35B-A3B-preview
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny-base
