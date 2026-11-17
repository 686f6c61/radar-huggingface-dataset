# moroz-ellmsha/sdai-mnn-model-archives

## Resumen

`moroz-ellmsha/sdai-mnn-model-archives` es un repositorio de empaquetado que distribuye los grafos y pesos preconveridos de Stable Diffusion 1.5 en formato MNN, listos para el proveedor Alpha MNN de la aplicacion Android SDAI (ShiftHackZ/SDAI-KMP). No se trata de un modelo nuevo ni de un reentrenamiento: el autor conserva intactos los bytes del grafo y los pesos originales de `taobao-mnn/stable-diffusion-v1-5-mnn-general` y anade el tokenizador binario MNN, un manifiesto de integridad, la licencia y la atribucion correspondiente.

El objetivo es practico: ofrecer una descarga unica y verificable (ZIP de 1.154.537.931 bytes con checksums SHA-256) para que los desarrolladores puedan ejecutar generacion texto-a-imagen en dispositivos Android sin tener que reconstruir el bundle a mano. El perfil publicado se denomina `sd15-512-general-int8-v1` y esta pensado para una imagen de 512x512 con CFG 7.5, sampler PNDM y entre 1 y 50 pasos de muestreo.

La relevancia es limitada pero concreta: cubre el nicho de inferencia local de difusion en Android mediante MNN 3.6.2, con cuantizacion de pesos a 8 bits. El proveedor se marca explicitamente como Alpha, por lo que la calidad de salida y la compatibilidad amplia de dispositivos siguen en evaluacion segun el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + text encoder CLIP + VAE) convertida a grafos MNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, no LLM) |
| Tipos de cuantizacion | pesos a 8 bits (int8); no implica activaciones INT8 |
| Idiomas soportados | no disponible (prompts en lenguaje natural, sin lista declarada) |
| Licencia | CreativeML OpenRAIL-M (runtime MNN bajo Apache-2.0) |
| Formato de pesos | grafos MNN con ficheros de pesos externos, tokenizador `tokenizer.mtok`, `manifest.json` |
| Version de runtime | MNN 3.6.2 |
| Resolucion de imagen | 512x512 |
| Sampler | PNDM |
| CFG | 7.5 |
| Pasos de muestreo | 1 a 50 |
| Tamano del repositorio | 1,2 GB |
| Modelo base | taobao-mnn/stable-diffusion-v1-5-mnn-general |

## Arquitectura y entrenamiento

El modelo subyacente es Stable Diffusion 1.5, un modelo de difusion latente con un UNet, un text encoder CLIP y un VAE. En este repositorio no hay entrenamiento ni ajuste fino: el autor declara explicitamente que no se reentrenan ni reconvierten pesos, y que el bundle conserva los bytes originales del grafo y los pesos preconveridos por taobao-mnn. La unica capa anadida es de empaquetado: tokenizador binario MNN (`tokenizer.mtok`), manifiesto de integridad (`manifest.json`), lista de checksums (`SHA256SUMS.txt`), licencia y fichero de atribucion (`NOTICE.md`).

La innovacion tecnica no esta en el modelo sino en el formato de despliegue: los grafos MNN con pesos externos permiten ejecutar el pipeline de difusion en Android con soporte de CPU y OpenCL, dependiendo del dispositivo. La cuantizacion es de pesos a 8 bits, y el autor advierte que esto no garantiza aceleracion por GPU ni un requisito de memoria fijo. El perfil esta fijado a 512x512, CFG 7.5, PNDM y entre 1 y 50 pasos.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) con Stable Diffusion 1.5.
- Inferencia local en Android mediante el runtime MNN 3.6.2.
- Ejecucion en CPU y, segun dispositivo, en OpenCL.
- Resolucion de salida fija de 512x512 en el perfil publicado.
- Control de pasos de muestreo entre 1 y 50 con sampler PNDM y CFG 7.5.
- Verificacion de integridad del bundle mediante SHA-256 y `manifest.json`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No se declaran capacidades multilingues especificas ni modo thinking, vision o audio.

## Casos de uso

- Generacion de imagenes offline en Android: integracion del ZIP en la app SDAI para producir ilustraciones de 512x512 sin conexion, usando el proveedor MNN Alpha y el runtime MNN 3.6.2.
- Prototipado de apps de creatividad movil: desarrolladores que quieran evaluar difusion local en dispositivos Android antes de comprometerse con un pipeline de produccion, gracias a la descarga unica y verificable.
- Demos y pruebas de concepto en ferias o entornos sin red: el bundle permite generar imagenes en el propio dispositivo, evitando dependencias de API externas.
- Verificacion de integridad en pipelines de distribucion: el `manifest.json` y `SHA256SUMS.txt` permiten validar el bundle antes de empaquetarlo en una APK o en un repositorio interno.
- Educacion y experimentacion con MNN: util para estudiar como se empaquetan grafos UNet, text encoder y VAE con pesos externos y tokenizador binario en el ecosistema MNN.
- Base para perfiles derivados: sirve como referencia de layout (ZIP raiz con grafos, pesos, tokenizador, licencia y NOTICE) para quien quiera publicar otros perfiles MNN con el mismo esquema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma oficial; el autor advierte que la cuantizacion a 8 bits no implica un requisito de memoria fijo y que hay que reservar espacio adicional para extraccion y ficheros de trabajo de inferencia.
- GPU recomendadas: no disponible; el soporte OpenCL depende del dispositivo Android concreto.
- Compatibilidad con GPU de consumo: no confirmada; el proveedor esta en estado Alpha y la compatibilidad amplia de dispositivos sigue en evaluacion.
- Opciones de despliegue: runtime MNN 3.6.2 dentro de la app SDAI (ShiftHackZ/SDAI-KMP) en Android; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sdai-mnn-model-archives (este) | no disponible | 512x512, PNDM, 1-50 pasos | MNN int8 con pesos externos | CreativeML OpenRAIL-M | Hugging Face, bundle Android |
| taobao-mnn/stable-diffusion-v1-5-mnn-general | no disponible | SD 1.5 estandar | MNN preconvertido | CreativeML OpenRAIL-M (upstream) | Hugging Face |
| stable-diffusion-v1-5/stable-diffusion-v1-5 | no disponible | SD 1.5 estandar | safetensors/diffusers | CreativeML OpenRAIL-M | Hugging Face |

La comparativa se limita al linaje directo del modelo, ya que no se dispone de datos de rendimiento publicados para este bundle ni para alternativas MNN comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El proveedor MNN de SDAI esta marcado como Alpha: la calidad de salida y la compatibilidad con dispositivos siguen bajo evaluacion.
- La cuantizacion a 8 bits de pesos no garantiza activaciones INT8, aceleracion por GPU ni un consumo de memoria fijo.
- El soporte de CPU y OpenCL depende del dispositivo Android concreto; no hay lista de dispositivos validados.
- Resolucion fija de 512x512 en el perfil publicado; no se documentan otras resoluciones.
- Riesgo de sesgos y alucinaciones visuales heredado de Stable Diffusion 1.5; el autor remite a la model card upstream para usos previstos, limitaciones y sesgos.
- La licencia CreativeML OpenRAIL-M incluye restricciones de uso; es obligatorio revisar `LICENSE` antes de uso comercial.
- El runtime MNN se distribuye bajo Apache-2.0, licencia distinta de la del modelo; hay que cumplir ambas.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso.
- Hay que reservar espacio adicional en disco para la extraccion del ZIP y los ficheros de trabajo de inferencia, mas alla del 1,2 GB del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moroz-ellmsha/sdai-mnn-model-archives
- Modelo base preconvertido: https://huggingface.co/taobao-mnn/stable-diffusion-v1-5-mnn-general/tree/56c93a62ac9d6b5d18605632b85e25f87281f317
- Modelo original SD 1.5 y tokenizador: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5/tree/451f4fe16113bff5a5d2269ed5ad43b0592e9a14
- Runtime MNN y exportador de tokenizador: https://github.com/alibaba/MNN/tree/7e3c6fb5225d3ccf22807ee641332669df34650d
- Aplicacion SDAI (KMP): https://github.com/ShiftHackZ/SDAI-KMP
