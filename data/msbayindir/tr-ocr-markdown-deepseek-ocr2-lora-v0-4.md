# msbayindir/tr-ocr-markdown-deepseek-ocr2-lora-v0.4

## Resumen
TR-OCR-Markdown v0.4 es un adaptador LoRA (PEFT) para el modelo multimodal `unsloth/DeepSeek-OCR-2`, desarrollado por el usuario `msbayindir`. Su funcion es convertir imagenes de documentos impresos en turco (leyes, formularios, contratos, tablas, facturas, recibos, notificaciones, correspondencia) en Markdown estructurado, preservando jerarquia de titulos, parrafos, listas y tablas de tipo pipe. El adaptador se distribuye como pesos safetensors de 0,3 GB sobre la base Apache-2.0, y esta especializado en un unico idioma: turco (`tr`).

El modelo resuelve un problema concreto: los OCR genericos y los modelos multimodales multilingues rinden mal sobre la tipografia turca (puntos de la i, caracteres como ğ, ş, ı, İ) y sobre la estructura documental administrativa (tablas de plantilla, jerarquia de articulos legales). La propuesta del autor es un ajuste fino ligero sobre DeepSeek-OCR-2 con datos sinteticos y reales anotados por LLM, medido sobre nueve conjuntos de test reales con caracter de referencia (CER).

La relevancia actual es doble: por un lado, demuestra que un adaptador LoRA de bajo coste puede reducir el CER de un OCR base en un orden de magnitud sobre dominios especificos (por ejemplo, de 45,7 % a 25,4 % en escaneos del Boletin Oficial turco); por otro, publica un pipeline completo de generacion de datos, control de calidad y medicion reproducible, lo que facilita la auditoria y la extension a otros idiomas o dominios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal DeepSeek-OCR-2 (image-text-to-text) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no declara cifra en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor valida bf16 y fp16; no se documentan GGUF ni int8/int4) |
| Idiomas soportados | turco (`tr`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT), libreria `peft` |

## Arquitectura y entrenamiento
El adaptador se monta sobre `unsloth/DeepSeek-OCR-2`, un modelo multimodal de tipo imagen-a-texto. La contribucion del autor es un ajuste LoRA entrenado sobre datos predominantemente sinteticos de documentos turcos ficticios, complementados en la version 0.4 con paginas reales de PDF born-digital, paginas escaneadas academicas, oficiales y de libros etiquetadas por un LLM, recibos y facturas en Markdown, y ecuaciones en LaTeX. El objetivo de entrenamiento es la transcripcion a Markdown estructurado, no solo texto plano.

La validacion tecnica se realizo con `transformers==4.57.6` y `peft==0.20.0`, con `_attn_implementation="eager"` y `torch_dtype` en bf16 si la GPU lo soporta, fp16 en caso contrario. El autor documenta que `merge_and_unload()` duplica la velocidad de inferencia manteniendo la salida identica, lo que indica que el adaptador es linealmente fusionable con la base. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO; el pipeline de datos, control de calidad y medicion se publica en un repositorio Git separado.

## Capacidades
- Conversion de imagen de documento a Markdown con jerarquia de titulos, parrafos, listas y tablas de tipo pipe.
- OCR de texto impreso en turco, incluyendo documentos legales, administrativos, academicos y comerciales.
- Reconocimiento de formulas y ecuaciones con salida en LaTeX (evaluado en el conjunto OCRTurk).
- Manejo de documentos born-digital (PDF renderizado) y de escaneos con degradacion (ruido, inclinacion, compresion).
- Procesamiento de fotografias de recibos, facturas y formularios, tanto en modo texto plano como en Markdown.
- Soporte de dos modos de prompt: `<image>\nOCR this image.` para texto plano y una variante para salida Markdown estructurada.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni audio en la informacion disponible.

## Casos de uso
- Digitalizacion de boletines oficiales: el modelo convierte escaneos del Boletin Oficial turco en Markdown estructurado con un CER del 25,4 %, lo que permite indexar y buscar articulos normativos en un pipeline de gestion documental publica.
- Extraccion de tablas de plantillas y escalafones: al preservar tablas pipe, es adecuado para convertir cuadros de personal y retribuciones en estructuras parseables por un ETL posterior.
- Procesamiento de facturas y recibos fotografiados: con un CER del 1,8 % en texto plano y del 0,4 % en Markdown sobre el conjunto moganai, sirve para alimentar sistemas de contabilidad o gestion de gastos.
- Conversion de articulos academicos escaneados: con un CER del 6,8 % en paginas de DergiPark y soporte de LaTeX, permite reconstruir preprints y articulos en repositorios institucionales.
- Digitalizacion de fondo bibliografico: sobre escaneos de libros de dominio publico alcanza un CER del 2,0 %, lo que lo hace util para proyectos de biblioteca digital masiva.
- Automatizacion de notificaciones y correspondencia administrativa: transforma tebligat, dekont y yazışma en Markdown listo para un gestor de expedientes, reduciendo la revision manual en flujos de back office.
- Construccion de corpus para entrenamiento: la salida Markdown estructurada y el pipeline de medicion publicado permiten generar datasets de OCR turco auditables y comparables entre versiones.

## Benchmarks y rendimiento
Resultados declarados por el autor (CER en %, menor es mejor; conjuntos de test no usados en entrenamiento; `verified: false`, es decir, no verificados de forma independiente):

| Conjunto de test | v0.3 (E3) | v0.4 (E5) |
|---|---:|---:|
| Paginas reales de leyes (PDF born-digital, 55 pag.) | 4,7 | 0,4 |
| Escaneos del Boletin Oficial (50 pag.) | 45,7 | 25,4 |
| OCRTurk (ODTU; 165 pag. reales, ecuaciones LaTeX, solo medicion) | 38,3 | 16,9 |
| Articulos academicos escaneados, DergiPark (109 pag.) | 7,7 | 6,8 |
| Documentos oficiales, escaneos RG/TBMM (104 pag.) | 32,3 | 6,9 |
| Escaneos de libros de dominio publico (49 pag.) | 12,4 | 2,0 |
| Recibos/facturas/formularios fotografiados, texto plano (moganai, 300 pag.) | 18,0 | 1,8 |
| Recibos/facturas/formularios fotografiados, Markdown (150 pag.) | no disponible | 0,4 |
| Paginas PDF reales con degradacion aplicada (87 pag.) | no disponible | 9,2 |

El autor indica que la mejora v0.3 a v0.4 es estadisticamente significativa con bootstrap emparejado (P = 1,00) en todos los conjuntos salvo el academico, donde la pagina tipica mejora (mediana de 3,5 % a 0,9 %) pero la media no resulta significativa por algunas paginas anomalas. En sentencias escaneadas del Tribunal Constitucional el CER baja del 29 % al 4 %; las tablas numericas mecanografiadas siguen siendo debiles (44 %). Las etiquetas de los conjuntos reales son anotaciones de modelo/LLM no validadas por el titular de los datos, y las mediciones se realizaron con las protecciones de seguridad activadas.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el adaptador pesa 0,3 GB, pero la inferencia requiere cargar el modelo base DeepSeek-OCR-2 completo en bf16 o fp16.
- GPU recomendadas: el autor valida sobre GPU con soporte bf16 (familias Ampere o superiores, como A100, H100 o RTX 4090); en GPUs sin bf16 se usa fp16.
- Viabilidad en GPU de consumo: no confirmada en la informacion disponible; depende del peso del modelo base, no del adaptador.
- Opciones de despliegue: `transformers` + `peft` (version validada: transformers 4.57.6, peft 0.20.0), con `merge_and_unload()` opcional para duplicar la velocidad. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el unico dato de rendimiento es la mejora de 2x al fusionar el adaptador.

## Comparativa con modelos similares
No se dispone de datos de modelos comparables en la informacion proporcionada. La comparacion natural es con el modelo base sin adaptador y con la version anterior del propio adaptador, resumida a continuacion:

| Modelo | Parametros | Contexto | CER destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tr-ocr-markdown-deepseek-ocr2-lora-v0.4 | no disponible (LoRA sobre DeepSeek-OCR-2) | no disponible | 0,4 % en leyes born-digital; 25,4 % en Boletin Oficial escaneado | Apache-2.0 | Hugging Face (repo 0,3 GB) |
| tr-ocr-markdown-deepseek-ocr2-lora-v0.3 | no disponible | no disponible | 4,7 % en leyes born-digital; 45,7 % en Boletin Oficial escaneado | Apache-2.0 | version anterior del mismo autor |
| unsloth/DeepSeek-OCR-2 (base sin adaptador) | no disponible | no disponible | no disponible en la informacion proporcionada | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias
- El modelo solo cubre turco; no se ha evaluado su comportamiento en otros idiomas y el adaptador puede degradar el rendimiento multilingue del modelo base.
- El rendimiento es muy desigual por dominio: 25,4 % de CER en escaneos del Boletin Oficial y 44 % en tablas numericas mecanografiadas, frente a 0,4 % en documentos born-digital. No es apto como sustituto universal de un OCR en produccion sin validacion por tipo de documento.
- Riesgo de alucinacion en documentos degradados: al ser un modelo generativo, puede completar texto ausente o inventar estructuras en paginas de baja calidad, especialmente en tablas y formulas.
- Las etiquetas de los conjuntos de test reales son anotaciones generadas por modelo/LLM y no han sido verificadas por el titular de los datos; los CER publicados no son verificados de forma independiente (`verified: false`).
- Las protecciones de seguridad estaban activadas durante la medicion, lo que puede afectar a la reproducibilidad exacta de las cifras.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (17 de noviembre de 2026): no hay evidencia de uso en produccion ni de validacion por terceros.
- Aunque la licencia es Apache-2.0, conviene revisar las condiciones del modelo base y de los datos de entrenamiento antes de un uso comercial, dado que parte del corpus se etiqueto con LLM y proviene de fuentes diversas.
- No se documentan contexto maximo, cuantizaciones ni soporte de tool calling, lo que limita su integracion en pipelines agenticos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/msbayindir/tr-ocr-markdown-deepseek-ocr2-lora-v0.4
- Modelo base: https://huggingface.co/unsloth/DeepSeek-OCR-2
- Repositorio del proyecto (generador de datos, control de calidad, herramientas de medicion, demo y `docs/report.md` §9): mencionado en la model card como repositorio Git separado, sin URL explicita en la informacion disponible.
- Informes de metricas: carpeta `metrics/` del repositorio del modelo (`*_report.json`, `*_summary.md`, `compare_*`).
