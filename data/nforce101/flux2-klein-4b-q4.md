# nForce101/flux2-klein-4b-q4

## Resumen

Este repositorio es un espejo (mirror) comunitario del paquete MLX cuantizado a 4 bits de FLUX.2 klein 4B, un modelo generativo de imagen de Black Forest Labs que trabaja tanto en texto-a-imagen como en imagen-a-imagen con múltiples referencias. La publicación corre a cargo de nForce101 y está pensada para la aplicación Pixai en macOS, que lo utiliza para generación y edición de imágenes en local sobre Apple Silicon. No se trata de un release oficial de Black Forest Labs: los pesos son idénticos byte a byte al paquete de mflux-community en la revisión `794cd159538149ad9830848508c31f0ea7088e58`.

El interés práctico está en que comprime un modelo de difusión de 4B parámetros más un text encoder Qwen3-4B en un paquete de 4,6 GB que cabe y funciona en un MacBook Air de 16 GB de memoria unificada. Con 4 pasos de muestreo y `guidance` 1.0, el autor reporta unos 85 segundos por imagen de 1024² en texto-a-imagen y entre 3 y 4,5 minutos para una edición con dos imágenes de referencia, con un pico de memoria de 7,7 a 9,9 GB.

La relevancia ahora mismo es la de las cuantizaciones locales: permite evaluar el comportamiento de la familia FLUX.2 en hardware de consumo Apple sin GPU dedicada, a cambio de una pérdida de calidad frente a los pesos originales que la model card no cuantifica. El repositorio no incluye resultados de benchmarks estándar ni documentación sobre los datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de imagen (FLUX.2 klein 4B) con text encoder Qwen3-4B y VAE FLUX.2; el detalle del backbone no se especifica en la model card |
| Parametros totales | 4B en el transformer (segun denominacion y carpeta `transformer/`) mas aproximadamente 4B del text encoder Qwen3-4B; el total exacto no esta desglosado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; el limite practico lo fija el text encoder Qwen3-4B y el tokenizer, sin cifra publicada) |
| Tipos de cuantizacion | MLX 4 bits con group size 64 en transformer (2,18 GB) y text encoder (2,26 GB); VAE sin cuantizar (0,17 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (se aplica sin cambios la licencia del modelo original) |
| Formato de pesos | safetensors en formato MLX; se incluye `bfl-config/` con las configuraciones originales y el tokenizer completo de BFL (revision `e7b7dc27`) |

Desglose de carpetas del repositorio (4,6 GB en total):

| Carpeta | Contenido | Tamano |
|---|---|---|
| `transformer/` | Transformer FLUX.2 klein 4B, MLX 4 bits (group size 64) | 2,18 GB |
| `text_encoder/` | Text encoder Qwen3-4B, MLX 4 bits | 2,26 GB |
| `vae/` | VAE de FLUX.2 | 0,17 GB |
| `tokenizer/` | Tokenizer usado por el cargador de mflux | 11 MB |
| `bfl-config/` | Configuraciones originales y tokenizer completo de BFL | 14 MB |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 klein 4B, un generador de imagenes por difusion de Black Forest Labs. Este repositorio no entrena ni ajusta nada: es una conversion de los pesos a MLX con cuantizacion de 4 bits y group size 64 sobre el transformer y sobre el text encoder Qwen3-4B, dejando el VAE a 0,17 GB practicamente intacto. El cargador empleado es mflux, y el paquete incluye el fichero `pixai-model.json` con el tamano y el SHA-256 de cada archivo para que la aplicacion Pixai verifique las descargas.

La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o destilacion. Tampoco describe innovaciones de atencion o decodificacion del backbone. El unico dato operativo verificable es el regimen de inferencia: 4 pasos con `guidance` 1.0, lo que sugiere un modelo ajustado para muestreo de pocos pasos, aunque esa caracteristica corresponde al modelo base y no se detalla en esta publicacion.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con resoluciones de trabajo de 1024² en las pruebas del autor.
- Edicion de imagen a partir de una o varias imagenes de referencia (image-to-image con multiples referencias); el ejemplo de la model card compone dos imagenes: una persona y un sombrero.
- Composicion semantica entre referencias: el prompt del ejemplo indica "poner a la mujer de la imagen 1 el sombrero de la imagen 2", es decir, transferencia de atributos entre imagenes de entrada.
- Inferencia local en Apple Silicon mediante MLX y mflux, sin dependencia de servicios en la nube.
- Ejecucion en modo `--low-ram`, pensado para equipos con memoria unificada ajustada.
- Verificacion de integridad de los pesos mediante SHA-256 por archivo.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio: no disponible / no aplica (es un modelo de generacion de imagen).

## Casos de uso

- Edicion de producto en catalogo: introducir una foto de producto y una imagen de referencia de fondo o estilo, y generar una variante coherente en local. El modelo acepta varias imagenes en el mismo paso, lo que evita encadenar herramientas externas.
- Prototipado de conceptos visuales en estudios pequenos: ciclos de texto-a-imagen de unos 85 segundos en un MacBook Air M4 permiten iterar decenas de variantes en una sesion sin coste por API.
- Prueba de vestuario o composicion de prendas: el ejemplo oficial de dos referencias (persona + prenda) se traslada directamente a flujos de previsualizacion de moda con material ya existente.
- Trabajo con material sensible que no puede salir del dispositivo: al ejecutarse integramente en local, es apto para imagenes medicas, legales o de menores donde subir archivos a un servicio externo no es viable.
- Integracion en aplicaciones macOS: la aplicacion Pixai ya lo usa como motor on-device; un desarrollador puede replicar el flujo con `mflux-generate-flux2-edit` y el paquete de pesos.
- Generacion de material de apoyo en documentacion tecnica o prototipos de interfaz, donde la latencia de minutos es aceptable y prima no depender de red.
- Evaluacion comparativa de la familia FLUX.2 en hardware Apple: sirve para medir calidad y tiempos antes de decidir si se justifica un despliegue en GPU dedicada con los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, FID, CLIP score u otros) en la informacion disponible. Las unicas mediciones son de latencia y memoria, tomadas por el autor:

| Medicion | Entorno | Resultado |
|---|---|---|
| Texto-a-imagen, 1024², 4 pasos, `--low-ram` | MacBook Air M4, 16 GB | Aproximadamente 85 s |
| Edicion con dos referencias | MacBook Air M4, 16 GB | 3 a 4,5 min |
| Pico de memoria | MacBook Air M4, 16 GB | 7,7 a 9,9 GB |

No hay datos de calidad comparada frente al modelo sin cuantizar, ni frente a otras cuantizaciones.

## Requisitos de hardware

- Memoria unificada: 16 GB es el minimo verificado (MacBook Air M4); el pico medido de 7,7 a 9,9 GB deja poco margen, por lo que 24 GB o 32 GB son recomendables para trabajar con varias referencias o resoluciones mayores.
- GPU: exclusivamente Apple Silicon via MLX. No hay soporte CUDA en este paquete, por lo que A100, H100 o RTX 4090 no son aplicables tal cual.
- Cabe en GPU de consumo: si, en los chips Apple M-series con memoria unificada suficiente; el autor lo ha probado en un M4 de gama base.
- Despliegue: mflux es la via documentada, con el comando `mflux-generate-flux2-edit --model <carpeta> --base-model flux2-klein-4b --low-ram --steps 4 --guidance 1.0 --image-paths ... --prompt ...`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: 85 s por imagen 1024² en texto-a-imagen y 180-270 s por edicion de dos referencias en el hardware citado; equivale a un throughput del orden de 0,7 imagenes por minuto en texto-a-imagen y de 0,2 a 0,3 en edicion, sin datos de paralelizacion por lotes.
- Almacenamiento: 4,6 GB de pesos, mas el espacio temporal de descarga si se valida el SHA-256 por archivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nForce101/flux2-klein-4b-q4 (este) | 4B transformer + Qwen3-4B | 1024² en las pruebas | MLX 4 bits, group size 64 | Apache 2.0 | Mirror comunitario, 4,6 GB, 0 descargas |
| mflux-community/flux2-klein-4b-mflux-q4 | 4B transformer + Qwen3-4B | No disponible | MLX 4 bits | Apache 2.0 (segun modelo base) | Pack original de referencia; pesos identicos byte a byte |
| black-forest-labs/FLUX.2-klein-4B | 4B transformer + Qwen3-4B | No disponible | Pesos sin cuantizar (precision original) | Licencia original de BFL, se aplica sin cambios | Release oficial; requiere mas memoria que la version 4 bits, cifra no disponible |

No se dispone de datos para comparar con otras familias de generacion de imagen de tamano equivalente en el material proporcionado.

## Limitaciones y advertencias

- No es un release oficial de Black Forest Labs: es un espejo de un paquete de terceros, con 0 descargas y 0 likes en el momento del registro, sin validacion independiente conocida.
- La cuantizacion a 4 bits introduce perdida de calidad frente a los pesos originales; la model card no incluye ninguna evaluacion de esa degradacion.
- Uso exclusivo en Apple Silicon con MLX: no hay ruta de despliegue documentada para CUDA ni para servidores x86.
- El pico de memoria de hasta 9,9 GB sobre 16 GB totales limita la ejecucion concurrente con otras aplicaciones y deja poco margen para resoluciones o lotes mayores.
- La latencia de 3 a 4,5 minutos por edicion con dos referencias descarta el uso en produccion interactiva o de alto throughput.
- No hay informacion sobre sesgos del dataset de entrenamiento, composicion demografica ni comportamiento diferencial por idioma del prompt.
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion: fidelidad imperfecta a instrucciones complejas, deformaciones en manos y texto, y deriva de identidad en la edicion con referencias.
- El soporte de idiomas en los prompts no esta documentado, por lo que no se puede garantizar un rendimiento equivalente en castellano frente a ingles.
- La licencia Apache 2.0 permite uso comercial, pero se aplica sin cambios la licencia del modelo original; conviene revisar `LICENSE.md`, `NOTICE` y los terminos de BFL antes de distribuirlo en un producto.
- Los pesos deben verificarse contra `pixai-model.json` (tamano y SHA-256) si se van a usar fuera de la aplicacion Pixai.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nForce101/flux2-klein-4b-q4
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Paquete MLX de referencia (pesos identicos): https://huggingface.co/mflux-community/flux2-klein-4b-mflux-q4
- Revision citada del paquete de referencia: `794cd159538149ad9830848508c31f0ea7088e58`
- Revision de las configuraciones originales de BFL: `e7b7dc27`

No se han encontrado en la informacion proporcionada papers, blogs tecnicos, repositorios de codigo ni demos adicionales.
