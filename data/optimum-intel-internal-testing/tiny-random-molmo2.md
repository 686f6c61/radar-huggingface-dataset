# optimum-intel-internal-testing/tiny-random-molmo2

## Resumen

`tiny-random-molmo2` es un modelo de prueba publicado por la organizacion `optimum-intel-internal-testing` en Hugging Face. No es un modelo entrenado ni destinado a uso real: se trata de una version diminuta con pesos aleatorios que reproduce la arquitectura de `allenai/MolmoWeb-4B` (familia Molmo2, modelo multimodal de imagen-a-texto) para utilizarse como fixture en los tests de OpenVINO GenAI, concretamente en `VLMPipeline` y en el exportador `genai-cli export`.

El modelo conserva intactos el tokenizer, las configuraciones del processor, la plantilla de chat y el codigo remoto (`*_molmo2.py`) del modelo base, pero sustituye el cuerpo del transformer y del ViT por variantes de 3 capas con dimensiones reducidas. El resultado son 39,6 millones de parametros en float32 (unos 0,2 GB de repositorio) que generan texto sin sentido de forma deliberada.

Su relevancia es puramente de ingenieria: permite validar pipelines de inferencia y exportacion multimodal (texto + vision) en entornos de integracion continua sin necesidad de descargar ni ejecutar un modelo de 4B parametros. Cualquier evaluacion de calidad, capacidades o rendimiento sobre este checkpoint carece de sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de texto tipo Qwen + ViT + adaptador), arquitectura Molmo2 de `allenai/MolmoWeb-4B` |
| Parametros totales | 39.601.920 (float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (vocabulario Qwen completo heredado del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`safe_serialization=True`), mas codigo remoto Python |

Detalles de configuracion segun la model card:

| Componente | Capas | Hidden size | Cabezas atencion / KV | Head dim | Intermediate size |
|---|---|---|---|---|---|
| Modelo de texto | 3 | 128 | 4 / 2 | 32 | 256 |
| Vision (ViT) | 3 | 64 | 2 / 2 | 32 | 128 |
| Adaptador | no aplica | 64 | 2 / 2 | 32 | 128 |

El adaptador conecta las dos ultimas capas del ViT (`vit_layers = [-1, -2]`) con el modelo de texto.

## Arquitectura y entrenamiento

La arquitectura es la de Molmo2: un modelo de lenguaje tipo Qwen combinado con un ViT y un adaptador que proyecta las representaciones visuales al espacio del texto. En este checkpoint, el generador de la model card reduce el text model a 3 capas (hidden 128, 4 cabezas de atencion, 2 cabezas KV, head_dim 32, FFN de 256) y el ViT a 3 capas (hidden 64, 2 cabezas, head_dim 32, FFN de 128). El adaptador usa hidden 64 con 2 cabezas y toma las dos ultimas capas del ViT.

No hay entrenamiento. Los pesos se inicializan aleatoriamente con `torch.manual_seed(0)` y una inicializacion gaussiana: desviacion tipica `1/sqrt(fan_in)` para matrices lineales y embeddings, `4/sqrt(fan_in)` para `lm_head`, y `0.02` para los sesgos; las capas de normalizacion se dejan en sus valores por defecto. No se aplico RLHF, DPO ni ajuste alguno, y no se documento composicion de dataset ni numero de tokens.

La innovacion tecnica relevante no esta en el modelo sino en su proposito: al mantener el tokenizer, processor, chat template y codigo remoto originales, sirve como caso de prueba fiel de la ruta de carga y exportacion de Molmo2. Requiere `trust_remote_code=True` y `transformers>=4.57,<4.58`, ademas de `einops` y `torchvision`.

## Capacidades

- Generacion de texto: tecnicamente produce tokens, pero sin significado; la model card indica explicitamente que genera "texto sin sentido".
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, con ViT y adaptador presentes, aunque con pesos aleatorios.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no evaluadas; hereda el vocabulario Qwen completo del modelo base, pero sin pesos entrenados que lo exploten.
- Capacidades especiales (thinking mode, vision real, audio): no disponible.
- Uso previsto: exclusivamente tests de integracion de OpenVINO GenAI (`VLMPipeline`, `genai-cli export`).

## Casos de uso

- Test de humo de `VLMPipeline` en OpenVINO GenAI: cargar el modelo y ejecutar una generacion imagen-texto para verificar que el pipeline compila y devuelve tokens, sin coste de descarga ni de computo de un modelo de 4B.
- Validacion del exportador `genai-cli export`: comprobar que la conversion de un modelo Molmo2 a formato OpenVINO completa correctamente la grafica, dado que la topologia es identica a la del modelo base.
- Integracion continua en repositorios de Optimum Intel: incluir el checkpoint en la bateria de tests unitarios para detectar regresiones en la carga de codigo remoto (`trust_remote_code`) y en el manejo de configuraciones de texto, ViT y adaptador.
- Pruebas de compatibilidad de versiones de `transformers`: verificar el rango declarado (`>=4.57,<4.58`) y las dependencias `einops` y `torchvision` en entornos aislados.
- Validacion de tokenizer y processor: al copiarse sin cambios desde `allenai/MolmoWeb-4B`, permite probar el preprocesado de imagenes y la plantilla de chat sin cargar los pesos reales.
- Reproduccion del script de generacion: el codigo incluido en la model card permite regenerar el checkpoint a partir de un snapshot de `MolmoWeb-4B`, util para crear fixtures equivalentes con otras dimensiones.
- Test de rutas de serializacion: comprobar la carga de safetensors en float32 y la coherencia entre `config.json` e indices de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo produce salidas aleatorias, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K, benchmarks multimodales) seria invalida por construccion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (39,6 M de parametros, unos 158 MB de pesos); en la practica, cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: ninguna en particular; el checkpoint esta pensado para ejecutarse en CPU a traves de OpenVINO GenAI. Cualquier GPU integrada o dedicada moderna es suficiente.
- Cabe en consumer GPU: si, en todas las gamas actuales (incluidas GTX 1050, RTX 3050, etc.), aunque no aporta ventaja usar GPU.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`, `genai-cli export`) es el destino declarado; tambien carga con `transformers` mediante `AutoModelForImageTextToText` y `trust_remote_code=True`.
- Latencia y throughput: no disponibles. Por el tamano, la latencia sera del orden de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `optimum-intel-internal-testing/tiny-random-molmo2` | 39,6 M | no disponible | Fixture de tests para OpenVINO GenAI | no disponible | Hugging Face (0 descargas) |
| `allenai/MolmoWeb-4B` | 4B (aproximado, segun nombre) | no disponible | Modelo multimodal real de imagen-a-texto | no disponible | Hugging Face |
| `optimum-intel-internal-testing/tiny-random-roformer` | no disponible | no disponible | Fixture de tests de la misma organizacion | no disponible | Hugging Face (429,3K descargas historicas) |

La comparacion con `MolmoWeb-4B` es la mas directa: misma arquitectura y mismo codigo, pero con pesos aleatorios y dimensiones reducidas. Frente a otros `tiny-random-*` de la organizacion, comparte el rol de fixture, aunque este es especifico para la ruta multimodal Molmo2.

## Limitaciones y advertencias

- No es un modelo funcional: genera texto sin sentido de forma intencionada; no debe usarse en produccion, demos ni evaluaciones.
- Pesos aleatorios: no ha recibido entrenamiento, por lo que no tiene capacidades linguisticas, de razonamiento ni de vision reales.
- Licencia no disponible: no se puede asumir uso comercial ni redistribucion sin consultar la licencia del modelo base `allenai/MolmoWeb-4B`.
- Dependencia de codigo remoto: requiere `trust_remote_code=True`, lo que implica ejecutar Python del repositorio; auditar antes de usar en entornos sensibles.
- Versionado estricto: exige `transformers>=4.57,<4.58`; fuera de ese rango la carga puede fallar.
- Dependencias adicionales: `einops` y `torchvision` son obligatorias.
- Idiomas no documentados: aunque hereda el vocabulario Qwen, no hay garantia de comportamiento multilingue.
- Riesgo de confusion: el nombre puede llevar a error si se busca un Molmo2 ligero real; no existe relacion con un modelo destilado o cuantizado.
- Sin benchmarks ni evaluaciones: no hay datos de rendimiento, sesgos o alucinacion medibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/optimum-intel-internal-testing/tiny-random-molmo2
- Organizacion en Hugging Face: https://huggingface.co/optimum-intel-internal-testing/models
- Modelo base: https://huggingface.co/allenai/MolmoWeb-4B
- Fixture comparable de la misma organizacion: https://openmodelstats.com/models/optimum-intel-internal-testing/tiny-random-roformer
