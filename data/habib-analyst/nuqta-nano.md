# habib-analyst/nuqta-nano

## Resumen

Nuqta-Nano es un modelo de traducción automática de tipo seq2seq desarrollado por el usuario habib-analyst, diseñado específicamente para transliterar roman urdu (urdu escrito con caracteres latinos) a escritura urdu nativa. Se trata de un transformer encoder-decoder a nivel de carácter, entrenado completamente desde cero y con un total de 3.410.234 parámetros, lo que lo sitúa en la categoría de modelos ultraligeros. El modelo no emplea ningún tipo de preentrenamiento ni transferencia: toda su capacidad proviene del corpus Dakshina.

El problema que aborda es concreto y de relevancia práctica: millones de hablantes de urdu escriben en roman urdu en mensajes, redes sociales y foros, pero la publicación formal, la educación y la comunicación institucional requieren escritura urdu en alfabeto persoárabe. Nuqta-Nano automatiza esa conversión palabra a palabra. Su entrenamiento se limita al split de léxico de Dakshina (106.260 pares romanización → palabra urdu) y su evaluación se realiza sobre palabras que el modelo no ha visto en ninguna forma durante el entrenamiento.

La relevancia actual del modelo reside en su enfoque de transparencia radical: el autor publica métricas reproducibles, modos de fallo sistemáticos medidos sobre el conjunto de test completo y scripts de verificación. No compite en capacidad general con modelos grandes, sino que ocupa un nicho lingüístico específico con un coste computacional mínimo (entrenamiento en CPU con 2 hilos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder estándar, a nivel de carácter |
| Parámetros totales | 3.410.234 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa palabra a palabra; el vocabulario de entrada es de 26 letras romanas + 4 especiales) |
| Tipos de cuantización | No disponible (el repo solo incluye safetensors en precisión original) |
| Idiomas soportados | Urdu (ur); entrada en roman urdu |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder convencional con 4 capas en el encoder y 4 en el decoder, dimensión de modelo (d_model) de 192, 4 cabezas de atención, dimensión de feed-forward de 512, dropout de 0,1 y embeddings posicionales aprendidos. Ambas mitades operan a nivel de carácter: el vocabulario de entrada consta de 26 letras romanas más 4 tokens especiales, y el de salida de 54 caracteres urdu más 4 especiales. La decodificación es greedy y completamente determinista. No hay componentes preentrenados de ningún tipo.

El entrenamiento utiliza exclusivamente el split de entrenamiento del léxico de Dakshina (106.260 pares), con el split de desarrollo empleado solo para seleccionar el checkpoint (mejor CER de desarrollo en la época 12 de 12) y el de test tocado una única vez por el script de evaluación. La receta es AdamW con betas 0,9/0,98, learning rate máximo de 1e-3 con warmup y decaimiento coseno, batch de 512, entropía cruzada y semilla 20261029, ejecutado únicamente en CPU con 2 hilos. El autor documenta un incidente: la primera ejecución se interrumpió por un reinicio de la máquina virtual tras la época 4 (checkpoint superviviente con CER de desarrollo 0,2231) y el entrenamiento se reanudó desde esos pesos con un optimizador nuevo.

## Capacidades

- Transliteración palabra a palabra de roman urdu a escritura urdu, con mapeo carácter a carácter aprendido.
- Manejo de ambigüedad many-to-many: 9.554 entradas de entrenamiento atestiguan más de una grafía urdu correcta para la misma entrada romanizada.
- Generalización a palabras no vistas: evaluado sobre 10.327 entradas romanizadas distintas del split de test con solapamiento verificado de 0 en tipos de palabra y lemas.
- Procesamiento de frases mediante transliteración secuencial de cada token (el modelo no tiene contexto de frase; opera palabra a palabra).
- Inferencia determinista y reproducible: misma entrada produce siempre la misma salida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada exclusivamente al par roman urdu → urdu.

## Casos de uso

- Normalización de contenido generado por usuarios: en plataformas de mensajería o redes sociales donde los usuarios escriben en roman urdu, el modelo puede convertir automáticamente los textos a escritura urdu nativa antes de almacenarlos o publicarlos, con un coste de inferencia mínimo al ser un modelo de 3,4 millones de parámetros.
- Preprocesamiento para pipelines de PLN en urdu: los sistemas de análisis de sentimiento, búsqueda o clasificación entrenados sobre escritura urdu nativa pueden recibir texto romanizado tras pasar por Nuqta-Nano, ampliando su cobertura a la forma en que los usuarios escriben realmente.
- Digitalización de archivos y correspondencia: conversión de documentos históricos o comunicaciones informales escritas en roman urdu a escritura formal para su archivo, catalogación o publicación institucional.
- Asistencia a la redacción formal: integración en editores de texto o correctores que sugieran la grafía urdu nativa de una palabra escrita en roman urdu, aprovechando que el modelo es determinista y ligero.
- Educación lingüística: herramienta de apoyo para estudiantes que aprenden la correspondencia entre la romanización y la escritura urdu, mostrando la conversión palabra a palabra y permitiendo comparar con la grafía atestiguada.
- Prototipado e investigación: al ser entrenable en CPU en minutos y con scripts de entrenamiento y verificación publicados, sirve como línea base reproducible para experimentos de transliteración o para estudiar modos de fallo en mapeos many-to-many.
- Búsqueda y recuperación de información: indexación de consultas en roman urdu traduciéndolas a escritura nativa para hacerlas coincidir con un índice construido sobre texto urdu formal.

## Benchmarks y rendimiento

Resultados medidos sobre el split de test de Dakshina (10.327 entradas romanizadas distintas, con tipos de palabra y lemas disjuntos del entrenamiento, solapamiento verificado de 0), bajo protocolo multi-referencia:

| Métrica | Test (held out) | Dev (selección) |
|---|---|---|
| CER de corpus ↓ | 0,2020 | 0,1970 |
| Exact-match accuracy ↑ | 0,3606 | 0,3756 |
| CER medio por palabra ↓ | 0,2194 | 0,2121 |

Comprobación secundaria en contexto (transliteración de frases de test palabra a palabra, 51.698 tokens, sin separación por tipo de palabra): exact-match de token 0,6352 y CER de token 0,1699.

CER medio por longitud de entrada: 1-3 letras 0,42; 4-6 letras 0,26; 7-9 letras 0,17; 10+ letras 0,13.

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión original (3,4 millones de parámetros en fp32 ocupan aproximadamente 13,6 MB de pesos; el resto es overhead de runtime).
- GPU recomendadas: ninguna en particular; el modelo se entrenó en CPU con 2 hilos y la inferencia es viable en CPU sin GPU.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (CPU, Raspberry Pi y similares).
- Opciones de despliegue: inferencia directa con PyTorch mediante el paquete `nuqta_nano` incluido en el repo (`Transliterator.from_dir`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 3,4 millones de parámetros con decodificación greedy a nivel de carácter, la latencia por palabra es previsiblemente de milisegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de transliteración roman urdu → urdu ni con líneas base de Dakshina.

## Limitaciones y advertencias

- El modelo opera palabra a palabra y no dispone de contexto de frase; la transliteración de oraciones se realiza token a token, lo que puede producir errores en palabras cuya grafía depende del contexto (por ejemplo, `hai` → ہائی en lugar de ہے).
- Exact-match de solo 0,3606 sobre palabras no vistas: aproximadamente dos de cada tres palabras del test no coinciden exactamente con ninguna grafía atestiguada.
- Modos de fallo sistemáticos medidos: confusión ں vs ن (238 casos de ن predicha como ں), confusiones entre retroflejas ٹ/ڈ/ڑ y dentales ت/د/ر (ٹ→ت 175, ت→ٹ 184, ڈ→د 141), y el grupo ہ/ح/ھ/ع/ا (ہ→ح 150, ہ→ا 147, ع→ا 167, eliminación de ا en 1.008 casos, la mayor clase de error).
- El modelo nunca produce la letra ھ de forma aislada, lo que provoca fallos en palabras cuya referencia es esa letra.
- Las diacríticas (zabar, zer, pesh, shadda) prácticamente no se predicen: solo 483 referencias de test las contienen y el exact-match sobre ellas es del 2,7%.
- Las palabras cortas son las más difíciles: CER medio de 0,42 para entradas de 1-3 letras.
- No se documentan sesgos sociales o demográficos en la información disponible, pero el entrenamiento se limita al léxico de Dakshina, lo que puede infrarepresentar vocabulario técnico, neologismos o variantes regionales.
- Riesgo de alucinación en el sentido de producir una grafía urdu plausible pero incorrecta para entradas ambiguas o fuera de distribución (por ejemplo, `monedou` → مونیدو frente a la referencia عمر).
- Licencia MIT: permite uso comercial y modificación sin restricciones adicionales documentadas.
- Para producción, conviene validar el rendimiento sobre el dominio concreto de aplicación, dado que las métricas publicadas corresponden al split de test de Dakshina y no a texto real de usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/habib-analyst/nuqta-nano
- Corpus Dakshina (origen de los datos de entrenamiento, referenciado en la model card): no se proporciona URL directa en la información disponible.
- Scripts de entrenamiento y verificación incluidos en el repo: `scripts/train.py`, `scripts/resume_train.py`, `scripts/prepare_data.py`, `examples/verify_metrics.py`.
- Resultados de evaluación detallados: `assets/eval_results.json` (en el repo).
- Salidas de ejemplo: `example_output.txt` (en el repo).
