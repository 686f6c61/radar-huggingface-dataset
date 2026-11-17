# carmineverdoliva-byte/d11-bioclip-int8

## Resumen

d11-bioclip-int8 es una version cuantizada a int8 del codificador de imagenes de BioCLIP v1, un modelo de vision fundacional entrenado por el Imageomics Institute para clasificacion taxonomica de organismos vivos. El artefacto lo publica el usuario independiente carmineverdoliva-byte como prueba tecnica (decision D11) para medir si un modelo de reconocimiento de plantas puede ejecutarse dentro del navegador de un iPhone mediante ONNX Runtime Web con WebGPU o WebAssembly. No se trata de un modelo nuevo ni de un fine-tune: es una conversion de formato y una cuantizacion del encoder original.

La base es OpenCLIP ViT-B/16, es decir, un transformer de vision con parches de 16x16 y aproximadamente 86 millones de parametros en el encoder de imagen. La unica modificacion respecto al original es la cuantizacion weight-only de 50 tablas de pesos grandes (MatMul, Gemm y Conv) a int8 con una escala float32 por canal de salida, restauradas en tiempo de ejecucion mediante `DequantizeLinear` y `Cast` en ONNX opset 17. El resto del grafo permanece intacto.

Su relevancia es acotada pero clara: demuestra que un modelo de vision fundacional especializado en biodiversidad puede comprimirse a 87,3 MB y ejecutarse en el navegador con una perdida de calidad practicamente nula (similitud coseno media de 0,9996 frente al fp16 original). El autor lo declara explicitamente como artefacto de prueba y no apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenCLIP ViT-B/16 (encoder de imagen de un modelo vision-lenguaje CLIP) |
| Parametros totales | no disponible (repo de 0,1 GB; el archivo ONNX pesa 87,3 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | int8 weight-only (50 tablas MatMul/Gemm/Conv con escala float32 por canal de salida); el resto del grafo en su tipo original |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de texto dependen del uso) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), archivo `bioclip-v1-image-encoder-int8.onnx` |

Especificaciones de entrada y salida:

| Parametro | Valor |
|---|---|
| Entrada | `pixel_values`, float32 `[batch, 3, 224, 224]` |
| Normalizacion | CLIP: media 0.48145466, 0.4578275, 0.40821073; desviacion 0.26862954, 0.26130258, 0.27577711 |
| Salida | `image_embedding`, float32 `[batch, 512]` |
| Tamano del archivo | 87.295.539 bytes (87,3 MB) |
| SHA-256 | `b7e02af2f88d77ae8019e3f3429d4c7d755e7de3d630cad87cea4bbd6282b1d3` |
| Runtime | onnxruntime / onnxruntime-web |

## Arquitectura y entrenamiento

El modelo subyacente, BioCLIP, es un CLIP con backbone ViT-B/16 entrenado por el Imageomics Institute sobre el arbol de la vida (TreeOfLife-10M), un conjunto de imagenes biologicas con anotaciones taxonomicas. El entrenamiento sigue el paradigma contrastivo imagen-texto de CLIP: se alinean embeddings de imagen y de texto en un espacio comun de 512 dimensiones, lo que permite clasificacion zero-shot comparando el embedding de una imagen con el de etiquetas textuales de especies. BioCLIP se presento en CVPR 2024 (Stevens et al.).

Este artefacto concreto no reentrena nada. Parte de la conversion ONNX de m3r1al (`naturalist-bioclip-v1`, commit `22a18d2fd141d2301968d93881b9e4431470c149`, pesos fp16), y aplica cuantizacion weight-only int8 mediante un script en Node.js, sin Python. Solo se cuantizan las 50 tablas de pesos de mayor tamano correspondientes a operaciones MatMul, Gemm y Conv; cada una recibe una escala float32 por canal de salida y se de-cuantiza en tiempo de ejecucion. El resto de operadores (normalizaciones, activaciones, atencion) se mantiene sin cambios. No hay decodificacion especulativa, atencion lineal ni otras innovaciones: la unica tecnica destacable es la cuantizacion por canal con preservacion casi exacta de los embeddings.

## Capacidades

- Extraccion de embeddings de imagen: produce un vector float32 de 512 dimensiones por imagen, normalizado segun el esquema CLIP.
- Clasificacion zero-shot de organismos: comparando el embedding de imagen con embeddings de texto de nombres cientificos o comunes, permite identificar especies sin cabecera de clasificacion adicional.
- Reconocimiento de plantas y taxones del arbol de la vida: el entrenamiento especifico de BioCLIP esta orientado a biodiversidad, no a objetos genericos.
- Busqueda y recuperacion visual: los embeddings permiten similitud coseno entre imagenes o entre imagen y texto.
- Ejecucion en navegador: compatible con ONNX Runtime Web sobre WebGPU y WebAssembly, lo que habilita inferencia on-device en el cliente.
- Procesamiento por lotes: la entrada admite dimension de batch arbitraria.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un encoder de imagen.
- No tiene modo thinking, vision generativa, audio ni capacidades multimodales mas alla del emparejamiento imagen-texto.

## Casos de uso

- Identificacion de plantas en el navegador: la app carga el ONNX con ONNX Runtime Web, captura una foto con la camara del movil, la redimensiona a 224x224, aplica la normalizacion CLIP y compara el embedding resultante con los embeddings de texto de un catalogo de especies. El tamano de 87,3 MB y los ~170 ms por imagen en WebGPU lo hacen viable en un iPhone.
- Asistente de cuidado de plantas con recomendaciones: una vez identificada la especie, la app cruza el resultado con una base de datos de cuidados (riego, luz, temperatura) y genera recomendaciones. El modelo aporta solo la etiqueta taxonomica; la logica de cuidados es externa.
- Clasificacion por lotes en servidor sin GPU: al ser un ONNX int8 de 87 MB, se puede ejecutar en CPU con onnxruntime en un contenedor pequeno, procesando catalogos de imagenes de herbario o inventarios de biodiversidad.
- Filtrado previo en pipelines de ciencia ciudadana: integrado en una app de observacion de fauna y flora, el modelo descarta imagenes que no contienen organismos o preclasifica taxones antes de la revision humana.
- Indexacion y busqueda visual de colecciones biologicas: generar embeddings de 512 dimensiones para cada imagen de una coleccion y construir un indice vectorial que permita busquedas por similitud o por descripcion textual.
- Prototipado de demos educativas: por su licencia MIT y su formato ONNX, sirve para talleres o cursos sobre modelos de vision en el navegador sin infraestructura de GPU.
- Validacion de viabilidad tecnica (el proposito declarado): medir latencia y calidad de un modelo de vision fundacional cuantizado en el navegador antes de decidir una arquitectura de producto.

## Benchmarks y rendimiento

El autor publica mediciones de fidelidad y latencia, no benchmarks estandar de clasificacion (MMLU, HumanEval, etc. no aplican a un encoder de vision). Los datos disponibles son:

| Metrica | Resultado |
|---|---|
| Similitud coseno media de embeddings vs. fp16 original (178 imagenes) | 0,9996 |
| Similitud coseno minima | 0,998 |
| Coincidencia de top-1 en imagenes de test | 45 de 46 |
| Latencia en Edge con WebGPU (int8) | ~170 ms por imagen |
| Latencia en Edge con WebGPU (fp16 original) | ~167 ms por imagen |

No se han publicado resultados de benchmarks estandar (ImageNet, iNat, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo pesa 87,3 MB y el grafo activa tensores de un batch de 224x224x3, por lo que cabe holgadamente en cualquier GPU integrada o en memoria de navegador.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU via WebAssembly y en GPU integrada o movil via WebGPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en GPU integradas; tambien en el navegador de un iPhone.
- Opciones de despliegue: ONNX Runtime (Python, C++, Node.js) y ONNX Runtime Web (WebGPU o WebAssembly) en el navegador. No se distribuye en GGUF, por lo que llama.cpp u Ollama no son aplicables directamente sin conversion adicional.
- Latencia y throughput: ~170 ms por imagen en Edge con WebGPU sobre PC, segun el autor. No hay datos de latencia en iPhone ni de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| d11-bioclip-int8 | no disponible (ViT-B/16, ~86 M en el encoder) | imagen 224x224, salida 512-d | ONNX int8 | MIT | Artefacto de prueba, solo encoder de imagen, orientado a navegador |
| imageomics/bioclip (original) | ~86 M en el encoder | imagen 224x224, salida 512-d | PyTorch | MIT | Modelo fundacional completo de vision-lenguaje para biodiversidad |
| m3r1al/naturalist-bioclip-v1 | no disponible | imagen 224x224, salida 512-d | ONNX fp16 | MIT | Conversion ONNX de partida, sin cuantizar |
| OpenCLIP ViT-B/16 | ~86 M en el encoder | imagen 224x224, salida 512-d | PyTorch | MIT (segun variante) | Modelo generico de vision-lenguaje; menos preciso en taxonomia biologica |

## Limitaciones y advertencias

- El propio autor declara que es un artefacto de prueba y no esta pensado para produccion.
- Solo incluye el encoder de imagen: no hay encoder de texto en este repositorio, por lo que la clasificacion zero-shot requiere obtener los embeddings de texto por separado (por ejemplo, con el modelo original).
- La cuantizacion es weight-only: no se cuantizan activaciones, lo que limita la ganancia de velocidad (apenas 3 ms de diferencia frente al fp16 en la medicion del autor) y mantiene el consumo de memoria de activaciones.
- Riesgo de confusion taxonomica: BioCLIP esta entrenado en el arbol de la vida, pero la precision depende de la calidad de las etiquetas textuales y de la cobertura del catalogo de especies usado.
- No hay datos publicados sobre sesgos, alucinacion (no genera texto) ni cobertura geografica o de idiomas del catalogo.
- La licencia MIT permite uso comercial, pero los autores de BioCLIP piden que las obras derivadas permanezcan de codigo abierto; conviene revisar el archivo LICENSE incluido, que mantiene los avisos de copyright del Imageomics Institute y de los autores de OpenCLIP.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia: no hay validacion externa de la conversion.
- No se especifican requisitos de version de ONNX Runtime ni compatibilidad probada con navegadores distintos de Edge.
- No hay informacion sobre el rendimiento en el iPhone, que es precisamente el objetivo declarado de la prueba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/carmineverdoliva-byte/d11-bioclip-int8
- Modelo base BioCLIP: https://huggingface.co/imageomics/bioclip
- Conversion ONNX de partida: https://huggingface.co/m3r1al/naturalist-bioclip-v1
- Paper de BioCLIP (Stevens et al., CVPR 2024): no disponible como enlace directo en la informacion proporcionada
- Repositorio de OpenCLIP: no disponible como enlace directo en la informacion proporcionada
