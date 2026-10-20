# bambocher/Qwen3.5-2B-oQ5e-mtp

## Resumen

`bambocher/Qwen3.5-2B-oQ5e-mtp` es un checkpoint cuantizado del modelo Qwen3.5-2B de Alibaba Cloud, publicado por el usuario bambocher mediante la herramienta oQ (oMLX v0.7.1rc1), que aplica cuantizacion de precision mixta. No es un modelo entrenado desde cero: es una redistribucion optimizada en pesos del modelo base, con un promedio efectivo de 7,255 bits por peso y un total de 2.274.069.824 parametros reales almacenados en safetensors.

El checkpoint conserva tres componentes diferenciados: el modelo de lenguaje (1,882 B de parametros), una torre de vision (0,331 B) y una cabecera MTP de prediccion multi-token (0,061 B). Esa tercera pieza es la que da sentido al sufijo `mtp` y permite tecnicas de decodificacion especulativa en tiempo de inferencia. El formato es MLX, es decir, esta pensado para ejecutarse en Apple Silicon a traves del ecosistema mlx-lm y herramientas compatibles.

Su relevancia practica es la de un modelo multimodal de ~2,27 B parametros que ocupa solo 2,1 GB en disco y cabe holgadamente en un portatil con memoria unificada. Sin embargo, la ficha publica no aporta informacion sobre licencia, longitud de contexto, idiomas ni resultados de evaluacion, y el repositorio acumula 15 descargas y 0 likes, por lo que se trata de un artefacto sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal de la familia Qwen3.5, con torre de vision y cabecera MTP de prediccion multi-token |
| Parametros totales | 2.274.069.824 (2,274 B) |
| Parametros activos | No aplica: la informacion disponible no indica arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta oQ: affine 5 bits (grupo 64), affine 6 bits (grupo 64), affine 8 bits (grupo 64) y BF16; media efectiva 7,255 bits/peso |
| Idiomas soportados | No disponible en la ficha del checkpoint; la serie Qwen3.5 se describe como multilingue en fuentes de terceros |
| Licencia | No disponible |
| Formato de pesos | safetensors, libreria `mlx` |
| Modelo base | Qwen3.5-2B (Alibaba Cloud / Qwen) |
| Desglose de parametros | Lenguaje 1,882 B; vision 0,331 B; cabecera MTP 0,061 B |
| Tamano del repositorio | 2,1 GB (1,921 GiB de pesos, 2,062 GB en total) |
| Descargas / likes | 15 / 0 |
| Fecha de publicacion | 2026-10-20 |

## Arquitectura y entrenamiento

El checkpoint reproduce la topologia del Qwen3.5-2B original: un transformer decoder-only con un componente visual segregado, lo que confirma que el modelo base es de tipo vision-lenguaje y no solo texto. La model card desglosa el reparto de bits por componente, lo que revela la estrategia de cuantizacion: el 76,118% de los pesos (1,731 B) se almacena en affine 5 bits con grupo de 64, mientras que un 14,967% (0,340 B) se mantiene en BF16. Ese porcentaje en BF16 corresponde presumiblemente a las capas mas sensibles a la cuantizacion, aunque el autor no detalla el criterio de seleccion.

La cabecera MTP de 0,061 B es una innovacion orientada a la decodificacion: predice varios tokens por paso y actua como modelo borrador interno, lo que permite acelerar la generacion mediante decodificacion especulativa sin necesidad de un draft model externo. Para que sea funcional, el runtime de inferencia debe reconocer y ejecutar esa cabecera; si el motor la ignora, el checkpoint se comporta como un modelo convencional con un pequeno sobrecoste de almacenamiento.

No se ha publicado informacion sobre datos de entrenamiento, volumen de tokens, composicion del corpus ni sobre si el modelo base paso por RLHF o DPO. Al ser un derivado cuantizado, sus caracteristicas de ajuste son heredadas del Qwen3.5-2B original, del que tampoco se aportan detalles de entrenamiento en la informacion disponible.

## Capacidades

- Generacion de texto y seguimiento de instrucciones, heredado del Qwen3.5-2B; la serie se describe con mejoras en razonamiento e instruction-following respecto a Qwen3.
- Procesamiento de imagen: la presencia de una torre de vision de 0,331 B confirma entrada multimodal, aunque la model card no detalla resoluciones, numero de imagenes por prompt ni tareas visuales soportadas.
- Decodificacion especulativa mediante cabecera MTP, con potencial de reduccion de latencia en generacion autoregresiva.
- Capacidades multilingues atribuidas a la serie Qwen3.5 por fuentes de terceros (Qualcomm AI Hub, Ollama); el checkpoint no declara lista de idiomas.
- Razonamiento, codigo, agentes y comprension visual: segun la descripcion publica de la serie Qwen3.5, no verificados de forma independiente para este checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Inferencia en dispositivo: el modelo base figura en Qualcomm AI Hub para exportacion on-device, lo que indica vocacion de despliegue en hardware de consumo.

## Casos de uso

- Asistente local en Mac: con 2,1 GB de pesos, el checkpoint se carga en un portatil Apple Silicon de gama media y permite un asistente conversacional totalmente offline, sin coste de API ni envio de datos a terceros.
- Transcripcion semantica de capturas y documentos escaneados: la torre de vision permite pasar una imagen y obtener descripcion o extraccion de datos estructurados, util para digitalizar facturas o albaranes en pequenas empresas.
- Clasificacion y enrutado de tickets con imagen adjunta: un soporte tecnico puede enviar una captura de error y el modelo genera una primera categorizacion y respuesta borrador antes de escalar a un humano.
- Prototipado rapido de pipelines multimodales: al ser un checkpoint MLX de 7,255 bits medios, sirve para validar logica de aplicacion en local antes de mover el mismo flujo a un modelo mayor en servidor.
- Generacion asistida en editores para entornos con restricciones de privacidad: sectores como sanidad o legal pueden desplegar el modelo en un equipo aislado y usarlo para resumir o reformular texto sin conexion externa.
- Aceleracion de demo en dispositivos Apple: la cabecera MTP permite mostrar generacion con baja latencia perceptible en presentaciones o pruebas de concepto, siempre que el runtime MLX utilizado la soporte.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores pueden medir la perdida de calidad frente al Qwen3.5-2B original y frente a la variante de 8 bits del mismo autor, aislando el efecto del reparto mixto de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta la distribucion de bits y el desglose de almacenamiento, sin tablas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/peso en disco: 1,921 GiB de pesos (2,062 GB de repositorio). Con cache KV y overhead del runtime, una estimacion razonable es de 2,5 a 3,5 GB de memoria unificada para contextos moderados; el dato exacto no esta publicado.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y 8 GB o mas de memoria unificada. No esta pensado para CUDA: la libreria declarada es `mlx`.
- GPU recomendadas: no aplica el catalogo NVIDIA (A100, H100, RTX 4090) porque el formato no es compatible con CUDA de forma nativa. El hardware objetivo son chips M1, M2, M3 y M4 en adelante.
- Opciones de despliegue: `mlx-lm` como via principal, ademas de aplicaciones que consumen checkpoints MLX del Hub como LM Studio o Atomic Chat (citadas en la ficha del modelo hermano oQ8e-mtp). Para Ollama existe el modelo base `qwen3.5:2b`, pero este checkpoint MLX concreto no se distribuye como GGUF.
- Latencia y throughput: no disponibles. La cabecera MTP deberia reducirlos frente a decodificacion autoregresiva pura, pero no hay cifras publicadas.
- Nota sobre cuantizacion: al no haber version GGUF en el repositorio, el despliegue en CPU x86 o en GPU NVIDIA requiere conversion adicional por parte del usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-oQ5e-mtp | 2,274 B | No disponible | Mixta 5/6/8 bits + BF16, 7,255 bits/peso | No disponible | MLX, 15 descargas |
| bambocher/Qwen3.5-2B-oQ8e-mtp | No disponible | No disponible | 8 bits (misma herramienta oQ) | No disponible | MLX |
| Qwen3.5-2B (original, via Qualcomm AI Hub) | 2 B (aproximado, denominacion comercial) | No disponible | Sin cuantizar / export on-device | No disponible en la informacion | AI Hub, Ollama (`qwen3.5:2b`) |

La comparacion cuantitativa no es posible con los datos disponibles: ni el contexto, ni la licencia, ni los resultados de evaluacion estan publicados para ninguna de las tres variantes. La diferencia verificable entre este checkpoint y la version de 8 bits del mismo autor es el regimen de cuantizacion (7,255 bits/peso frente a 8 bits), con el consiguiente intercambio entre tamano en disco y fidelidad respecto al modelo original.

## Limitaciones y advertencias

- Perdida por cuantizacion: las capas en 5 bits (76% de los pesos) introducen degradacion acumulable frente al Qwen3.5-2B en BF16, especialmente en tareas de razonamiento largo y matematicas; no hay evaluacion publicada que cuantifique esa perdida.
- Licencia no declarada: sin terminos explicitos, no se puede asumir uso comercial. Es un bloqueo real para produccion hasta confirmar la licencia del modelo base Qwen3.5-2B y la del propio checkpoint.
- Sin validacion comunitaria: 15 descargas y 0 likes implican que nadie ha reportado resultados de calidad, fallos de carga o comportamiento anomalo.
- Dependencia de MLX: el checkpoint no es portable a vLLM, TGI o llama.cpp sin conversion previa; el publico objetivo son equipos Apple.
- La cabecera MTP puede no estar soportada por todos los runtimes; en ese caso ocupa 0,073 GB sin aportar aceleracion.
- Riesgo de alucinacion: inherente a un modelo de 2 B de parametros, acentuado por la cuantizacion en tareas de recuperacion de hechos y citas.
- Idiomas y contexto no documentados: no se puede garantizar cobertura de castellano ni un tamano de ventana concreto para conversaciones multi-turno largas.
- Ausencia de informacion sobre sesgos: el autor no publica analisis de sesgo ni composicion del corpus de entrenamiento del modelo base.
- Fecha de publicacion futura respecto a los habitos de consumo habituales del ecosistema: conviene verificar la procedencia y la integridad de los pesos antes de integrarlos en un pipeline.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/bambocher/Qwen3.5-2B-oQ5e-mtp
- Variante de 8 bits del mismo autor: https://huggingface.co/bambocher/Qwen3.5-2B-oQ8e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Implementacion de referencia en ai-hub-models: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_5_2b/README.md
- Modelo base en Ollama: https://ollama.com/library/qwen3.5:2b
