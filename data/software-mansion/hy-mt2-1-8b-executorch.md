# software-mansion/Hy-MT2-1.8B-ExecuTorch

## Resumen

Hy-MT2-1.8B-ExecuTorch es una exportación del modelo de traducción automática Tencent/Hy-MT2-1.8B al formato ExecuTorch (`.pte`), publicada por Software Mansion para su uso con la librería React Native ExecuTorch. El objetivo no es ofrecer un modelo nuevo, sino proporcionar artefactos listos para ejecutarse en dispositivo (on-device), sin necesidad de servidor, en aplicaciones móviles y de escritorio construidas con React Native. La relevancia actual está en la traducción local con privacidad total: el texto nunca sale del dispositivo.

El modelo base es un transformer de 1.800 millones de parámetros especializado en traducción multilingüe, con licencia Apache 2.0. Esta exportación incluye cuatro variantes cuantizadas: dos para el backend XNNPACK (activaciones int8 dinámicas con pesos int4 en grupos de 32, o pesos int8 por canal) y dos para el backend MLX de Apple (int8 o int4 en grupos de 64, solo pesos). El repositorio ocupa 6,0 GB e incluye tokenizer y configuraciones.

La ficha se centra en las características de la exportación (tamaños, precisión, backend, compatibilidad con ExecuTorch v1.4.1) y en las del modelo subyacente cuando la información está disponible. No se han publicado datos de benchmarks propios en la model card de esta exportación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Tencent/Hy-MT2-1.8B); detalle interno no disponible |
| Parámetros totales | 1.800 millones (1.8B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | XNNPACK: 8da4w (activaciones int8 dinámicas, pesos int4 grupo 32) y 8da8w (pesos int8 por canal); MLX: int8 e int4 (grupo 64, solo pesos) |
| Idiomas soportados | no disponible (modelo de traducción; la model card no enumera idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (programas compilados); tokenizer en JSON; no se distribuyen safetensors ni GGUF en este repo |

Tamaños de los artefactos:

| Variante | Backend | Precisión | Tamaño |
|---|---|---|---|
| `1_8b/xnnpack/hy_mt2_1_8b_xnnpack_8da4w.pte` | XNNPACK | 8da4w | 1,2 GB |
| `1_8b/xnnpack/hy_mt2_1_8b_xnnpack_8da8w.pte` | XNNPACK | 8da8w | 2,0 GB |
| `1_8b/mlx/hy_mt2_1_8b_mlx_int8.pte` | MLX | int8 | 1,8 GB |
| `1_8b/mlx/hy_mt2_1_8b_mlx_int4.pte` | MLX | int4 | 952 MB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Tencent/Hy-MT2-1.8B (número de capas, dimensión oculta, mecanismo de atención, composición del dataset de entrenamiento, uso de RLHF/DPO o número de tokens). Lo único confirmado es que se trata de un modelo de traducción de 1.800 millones de parámetros con licencia Apache 2.0, y que su prompt de inferencia sigue un formato de chat con tokens especiales (`<｜hy_begin▁of▁sentence｜>`, `<｜hy_User｜>`, `<｜hy_Assistant｜>`).

La contribución técnica de esta exportación es la conversión a ExecuTorch y la cuantización. En XNNPACK se usan activaciones int8 dinámicas con pesos int4 (grupo 32) o int8 por canal; según la model card, la variante de 4 bits cuesta entre 0,2 y 1,5 puntos de BLEU, reduce el tamaño un 43 % y acelera la decodificación 1,5 veces. En MLX se aplica cuantización solo de pesos, int8 por defecto o int4 en grupos de 64; la variante int4 es aproximadamente un 35 % más rápida en un iPhone 16, pero pierde 3,4 puntos de BLEU en inglés→chino. El tokenizer upstream se ha modificado (normalizador a `null` y regex de `Split` ampliadas) para evitar un fallo de carga en versiones antiguas de `pytorch/tokenizers`, sin alterar los ids de token.

## Capacidades

- Traducción automática de texto entre idiomas, con instrucciones en el prompt que especifican el idioma destino.
- Formato de prompt de chat con tokens especiales de usuario y asistente; admite prompts en inglés y en chino (este último recomendado cuando alguno de los idiomas es chino).
- Ejecución on-device mediante ExecuTorch, sin dependencia de red.
- Compatibilidad con React Native ExecuTorch a través del registro de modelos de la librería.
- Cuatro perfiles de precisión/rendimiento según backend y dispositivo.
- No se documentan capacidades de tool calling, agentes, visión, audio, matemáticas avanzadas ni razonamiento multi-paso; el pipeline declarado es exclusivamente `translation`.

## Casos de uso

- Traducción en aplicaciones móviles React Native: integración mediante `react-native-executorch` con la constante del registro de modelos; el texto se procesa localmente, lo que elimina la latencia de red y mantiene la privacidad del contenido traducido.
- Traducción de mensajes en apps de mensajería: la variante int4 de MLX (952 MB) permite traducir mensajes entrantes en un iPhone sin enviar el texto a servidores externos.
- Traducción de documentos y notas personales: con la variante XNNPACK 8da8w (2,0 GB) se obtiene mayor fidelidad para textos largos en dispositivos con más memoria disponible.
- Asistentes de viaje sin conexión: traducción de frases en tiempo real en modo avión o con conectividad limitada, usando el backend XNNPACK en Android o MLX en iOS.
- Localización de contenido generado por usuarios: traducción de reseñas, comentarios o publicaciones en el propio dispositivo antes de almacenarlas, reduciendo el coste de infraestructura de traducción en la nube.
- Aplicaciones de accesibilidad: subtitulado o lectura traducida de texto capturado en pantalla, con baja latencia gracias a la decodificación acelerada de las variantes cuantizadas.
- Prototipado de funciones de traducción en apps de escritorio y móviles: el formato `.pte` permite desplegar el mismo artefacto en distintos runtimes ExecuTorch, simplificando las pruebas multiplataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas relativas de la cuantización: la variante XNNPACK 8da4w pierde entre 0,2 y 1,5 puntos de BLEU respecto a mayor precisión, con un 43 % menos de tamaño y 1,5 veces más velocidad de decodificación; la variante MLX int4 es un 35 % más rápida en iPhone 16 pero pierde 3,4 puntos de BLEU en inglés→chino. No se indican valores absolutos de BLEU, MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM/RAM estimada: entre 952 MB (MLX int4) y 2,0 GB (XNNPACK 8da8w) de memoria para los pesos; hay que sumar la memoria del runtime y del estado de inferencia.
- Backend MLX: exclusivo de Apple Silicon (iPhone, iPad, Mac); la variante int4 está pensada para iPhone 16 según la model card.
- Backend XNNPACK: orientado a CPU en Android, iOS y escritorio; no requiere GPU dedicada.
- GPU de servidor (A100, H100, RTX 4090): no aplica; el modelo está exportado para ejecución on-device, no para despliegue en servidores con esas GPU.
- Cabe en dispositivos móviles de gama alta y en ordenadores de consumo; la variante de 952 MB es la más adecuada para móviles con memoria limitada.
- Opciones de despliegue: ExecuTorch v1.4.1 (runtime requerido) y React Native ExecuTorch. No se distribuyen pesos en GGUF ni safetensors, por lo que llama.cpp, Ollama, vLLM o TGI no son aplicables directamente a estos artefactos.
- Latencia y throughput: no disponibles en cifras absolutas; solo se documentan las ganancias relativas de las variantes cuantizadas indicadas arriba.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada, por lo que la comparación se limita a características objetivas conocidas.

| Modelo | Parámetros | Contexto | Formato de despliegue | Licencia |
|---|---|---|---|---|
| Hy-MT2-1.8B-ExecuTorch (esta ficha) | 1,8B | no disponible | ExecuTorch `.pte` (on-device) | Apache 2.0 |
| Tencent/Hy-MT2-1.8B (upstream) | 1,8B | no disponible | Pesos originales (no detallado) | Apache 2.0 |
| Alternativas de traducción on-device de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible modelos comparables con exportación ExecuTorch y licencia permisiva para traducción; se indica "no disponible".

## Limitaciones y advertencias

- La compatibilidad con el runtime está fijada a ExecuTorch v1.4.1; ExecuTorch no garantiza compatibilidad hacia delante, por lo que runtimes más antiguos pueden fallar al cargar los `.pte`.
- La cuantización introduce pérdida de calidad medible: hasta 1,5 puntos de BLEU en XNNPACK 8da4w y 3,4 puntos de BLEU en MLX int4 para inglés→chino.
- El prompt debe seguir el formato exacto de la model card, sin system prompt; un formato incorrecto puede degradar la traducción.
- Cuando alguno de los idiomas es chino debe usarse el prompt en chino de la model card; no hacerlo puede afectar a la calidad.
- El tokenizer incluido ha sido modificado respecto al upstream para sortear un fallo de carga; los ids no cambian, pero conviene validar el comportamiento con textos que dependan de la normalización.
- No se documentan sesgos, cobertura exacta de idiomas ni tasas de alucinación; al ser un modelo de traducción, el riesgo principal es la traducción infiel o la omisión de contenido en textos largos o especializados.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base upstream y de las dependencias (ExecuTorch, React Native ExecuTorch, MLX).
- No se distribuyen pesos en formatos estándar (safetensors, GGUF), lo que limita su uso fuera del ecosistema ExecuTorch.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/software-mansion/Hy-MT2-1.8B-ExecuTorch
- Modelo base upstream: https://huggingface.co/tencent/Hy-MT2-1.8B
- Librería React Native ExecuTorch: https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
- Pull request del tokenizer: https://github.com/meta-pytorch/tokenizers/pull/225
