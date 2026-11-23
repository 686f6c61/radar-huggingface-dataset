# addiesam/SenseNova-Loop-9B-QVB8-5e-4

## Resumen

SenseNova-Loop-9B-QVB8-5e-4 es un paquete de pesos cuantizados del modelo multimodal SenseNova-Loop-9B (desarrollado por SenseNova), publicado por el investigador independiente addiesam bajo el identificador `addiesam/SenseNova-Loop-9B-QVB8-5e-4`. No se trata de un modelo nuevo, sino de una compresion certificada del modelo base bf16 mediante el formato propietario QVB8, disenado especificamente para ejecutarse con el motor de inferencia QVB8 del mismo autor. El paquete ocupa 8,3 GB en disco y aplica una cota de error L-infinito de tau = 0,0005 sobre cada peso restaurado.

La relevancia de este paquete no reside en la compresion en si (que el autor describe como modesta), sino en que el motor QVB8 decodifica los pesos comprimidos dentro de sus propios kernels CUDA, de modo que el modelo se ejecuta con un consumo de VRAM cercano al tamano del fichero comprimido en lugar del checkpoint bf16 completo. Ademas, el motor incorpora una cache KV tambien comprimida, lo que permite ejecutar contextos largos en hardware limitado.

Es importante subrayar que este paquete **no es cargable directamente con `transformers`** ni con otros motores de inferencia convencionales; requiere el motor QVB8 v1.3.0 o superior. La model card declara 370 tensores comprimidos con una media de 7,59 bits por peso, y el pipeline declarado es `image-text-to-text`, lo que indica que el modelo base es multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base SenseNova-Loop-9B, multimodal image-text-to-text) |
| Parametros totales | 4.640.880 (segun safetensors del paquete comprimido; el modelo base se denomina 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el motor QVB8 soporta cache KV comprimida para contextos largos) |
| Tipos de cuantizacion | QVB8 con cota L-infinito tau = 0,0005; 370 tensores comprimidos a 7,59 bits por peso de media; certificado para fp16 y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | QVB8 (safetensors como contenedor; no cargable en `transformers`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base SenseNova-Loop-9B no se detalla en la informacion proporcionada; el pipeline declarado es `image-text-to-text`, lo que confirma su naturaleza multimodal (entrada de imagen y texto, salida de texto). El paquete aqui descrito no entrena ningun modelo: es una compresion de los pesos del modelo base bf16 de SenseNova.

El metodo de compresion QVB8 asigna un ancho de bits por fila a cada matriz de pesos y verifica el resultado tras el empaquetado. Para cada tensor se registra en `manifest.json` el error maximo (`max_err`) entre el valor restaurado y el peso bf16 original, y ningun tensor supera tau = 0,0005. El empaquetado no utiliza datos de calibracion: depende unicamente de los pesos. Se incluye un fichero `escape_tables.json` que permite al motor leer solo la tabla fp16 en ejecuciones fp16, acelerando la decodificacion. La innovacion principal es la garantia de cota L-infinito (control del peor caso, no de la media), junto con la decodificacion de pesos y cache KV directamente en kernels CUDA del motor QVB8.

## Capacidades

- Generacion de texto y comprension de imagenes (pipeline `image-text-to-text`), heredadas del modelo base SenseNova-Loop-9B.
- Conversacion multi-turno (etiqueta `conversational`).
- Ejecucion con contexto largo gracias a la cache KV comprimida del motor QVB8.
- Despliegue en hardware de baja VRAM mediante decodificacion en GPU de pesos comprimidos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue de un modelo multimodal de 9B en GPUs de consumo: el paquete de 8,3 GB permite ejecutar el modelo con una VRAM cercana al tamano del fichero, lo que lo hace viable en tarjetas con 12-16 GB en lugar de requerir el checkpoint bf16 completo.
- Procesamiento de documentos con imagenes en entornos con recursos limitados: al combinar entrada image-text-to-text con cache KV comprimida, se pueden procesar paginas escaneadas o capturas con contextos largos en estaciones de trabajo modestas.
- Asistentes conversacionales multi-turno autoalojados: la etiqueta `conversational` y la cache KV comprimida permiten mantener historiales largos de conversacion sin agotar la memoria.
- Investigacion sobre compresion certificada: el paquete sirve como caso de estudio reproducible del metodo QVB8, con `max_err` por tensor verificable en `manifest.json`.
- Comparacion de trade-offs tau: el autor publica tambien el paquete tau = 1e-3 (7,2 GB), lo que permite medir el impacto de la cota de error en calidad y tamano en un mismo modelo.
- Experimentacion con motores de inferencia alternativos: util para evaluar el rendimiento del motor QVB8 frente a vLLM o llama.cpp en tareas multimodales, siempre que se disponga de los pesos en formato estandar para la comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,3 GB, segun el autor, al decodificar los pesos en los kernels CUDA del motor QVB8 (frente al checkpoint bf16 completo).
- GPU recomendadas: no disponible de forma explicita; el autor menciona que necesita maquinas para probar otras generaciones de GPU.
- GPU de consumo: viable en tarjetas con 12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) segun el tamano del paquete; no confirmado por el autor.
- Opciones de despliegue: exclusivamente el motor QVB8 v1.3.0 o superior (https://github.com/addiesam/qvb8). No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-QVB8-5e-4 (este) | 9B (base) | no disponible | QVB8, 8,3 GB | Apache-2.0 | QVB8 v1.3.0+ |
| SenseNova-Loop-9B-QVB8-1e-3 | 9B (base) | no disponible | QVB8, 7,2 GB | Apache-2.0 | QVB8 v1.3.0+ |
| sensenova/SenseNova-Loop-9B (bf16) | 9B | no disponible | safetensors bf16 | Apache-2.0 | transformers y otros |

No se dispone de datos de rendimiento comparativo entre estos paquetes ni con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no es cargable con `transformers` ni con motores convencionales; depende exclusivamente del motor QVB8 v1.3.0 o superior, lo que limita la portabilidad y crea dependencia de un proyecto de un unico autor.
- La cota L-infinito cubre unicamente los pesos almacenados; no garantiza que las respuestas del modelo sean identicas a las del original ni correctas. Diferencias en el motor, el tamano de lote o el orden de las operaciones en coma flotante producen salidas ligeramente distintas.
- El autor advierte que la compresion en si es modesta; el beneficio real proviene del motor, no del formato.
- Riesgo de alucinacion: inherente al modelo base; no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: no disponibles; la model card no declara idiomas soportados.
- Licencia Apache-2.0 heredada del modelo base, permisiva para uso comercial, pero el motor QVB8 tambien es Apache-2.0 y se distribuye sin garantia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es un investigador independiente; no hay validacion externa del paquete.
- El numero de parametros reportado por safetensors (4.640.880) no concuerda con la denominacion 9B del modelo base, probablemente porque refleja solo los tensores empaquetados; conviene verificarlo antes de planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/addiesam/SenseNova-Loop-9B-QVB8-5e-4
- Paquete alternativo tau = 1e-3: https://huggingface.co/addiesam/SenseNova-Loop-9B-QVB8-1e-3
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Motor QVB8: https://github.com/addiesam/qvb8
- Release del motor v1.3.0: https://github.com/addiesam/qvb8/releases/tag/v1.3.0
- Paper I (contrato e indice de banda virtual): https://doi.org/10.5281/zenodo.23815007
- Paper II (compresion de pesos, cache KV y activaciones): https://doi.org/10.5281/zenodo.23816044
- Patrocinio del autor: https://github.com/sponsors/addiesam
