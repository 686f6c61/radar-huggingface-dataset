# Isa0/hatespeech

## Resumen

El modelo `Isa0/hatespeech` es un clasificador de texto especializado en la detección de discurso de odio, lenguaje ofensivo y contenido neutral. Desarrollado por Isa0, se basa en el modelo transformer `distilbert-base-uncased` y se distribuye en formato ONNX, tanto en precisión completa (FP32) como en versión cuantizada dinámicamente a INT8, lo que lo hace adecuado para inferencia de baja latencia en CPU y dispositivos periféricos. Su objetivo principal es distinguir entre hostilidad dirigida a grupos protegidos (hate speech), vulgaridad o insultos sin odio dirigido (offensive language) y lenguaje benigno o conversacional.

El modelo fue entrenado sobre el dataset de Davidson et al. (2017), compuesto por aproximadamente 24.783 muestras anotadas, y emplea pesos de clase balanceados para mitigar el fuerte desequilibrio entre clases (el discurso de odio representa solo un 5,8 % de los datos). La versión INT8 reduce el tamaño del archivo de ~255 MB a ~64 MB, con una latencia media de ~17 ms por muestra en CPU estándar, lo que lo convierte en una opción práctica para moderación de contenido en tiempo real. Su licencia CC0-1.0 permite uso libre sin restricciones de atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT-base-uncased) |
| Parametros totales | no disponible (basado en DistilBERT-base, ~66M, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (según el código de ejemplo) |
| Tipos de cuantizacion | FP32 (original) e INT8 dinámico (cuantización de pesos) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC0-1.0 (dominio público) |
| Formato de pesos | ONNX (archivos `.onnx`) |

## Arquitectura y entrenamiento

El modelo se construye sobre `distilbert-base-uncased`, una versión destilada de BERT con arquitectura transformer encoder. Se añade una capa de clasificación de tres clases (hate speech, offensive language, neither). El entrenamiento se realizó sobre el dataset de Davidson et al. (2017), con una división estratificada 80 % entrenamiento, 10 % validación y 10 % test. Se utilizó la función de pérdida `CrossEntropyLoss` con pesos de clase normalizados por frecuencia inversa, optimizador AdamW (learning rate 2×10⁻⁵, weight decay 0,01), scheduler con warmup lineal del 10 % de los pasos y decaimiento lineal, dropout de 0,2 y early stopping monitorizando la macro F1 de validación con paciencia de 2 épocas. La cuantización INT8 se realizó mediante `onnxruntime.quantization.quantize_dynamic`, que convierte los pesos a enteros de 8 bits manteniendo las activaciones en punto flotante, logrando una reducción de tamaño de ~75 % sin pérdida significativa de precisión según el autor.

## Capacidades

- Clasificación de texto en tres categorías: discurso de odio dirigido, lenguaje ofensivo (vulgaridad/insultos) y contenido neutral.
- Distinción fina entre odio real y lenguaje ofensivo general, útil para moderación matizada.
- Inferencia de baja latencia en CPU (~17 ms por muestra con INT8) gracias a la cuantización y al formato ONNX.
- Entrada dinámica en lote y longitud de secuencia (hasta 128 tokens).
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio; es exclusivamente un clasificador de texto.

## Casos de uso

- Moderación de comentarios en redes sociales: el modelo puede clasificar automáticamente comentarios de usuarios en tiempo real, marcando aquellos que contienen discurso de odio para revisión humana o eliminación, gracias a su baja latencia en CPU.
- Filtrado de contenido en foros y comunidades online: integrable en pipelines de publicación para bloquear mensajes ofensivos antes de que sean visibles, reduciendo la carga de moderadores.
- Análisis de sentimiento y clima social: permite monitorizar grandes volúmenes de texto (tweets, reseñas) para detectar picos de hostilidad hacia grupos específicos, útil para investigación sociológica.
- Detección de ciberacoso en plataformas educativas o de mensajería: puede señalar conversaciones que contengan insultos o amenazas, ayudando a proteger a menores o colectivos vulnerables.
- Cumplimiento de políticas de contenido en aplicaciones empresariales: empresas que gestionan contenido generado por usuarios pueden usar el modelo para auditar y reportar incumplimientos de sus términos de servicio.
- Investigación académica sobre discurso de odio: el modelo sirve como herramienta de anotación automática para etiquetar corpus, reduciendo el esfuerzo manual en estudios de lingüística computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo proporciona métricas de rendimiento operativo: latencia media de ~28 ms en FP32 y ~17 ms en INT8 sobre CPU estándar, y tamaño de archivo de ~255 MB (FP32) y ~64,27 MB (INT8). No se reportan valores de precisión, recall o F1 sobre el conjunto de test, por lo que no es posible comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- Inferencia en CPU: el modelo INT8 requiere ~64 MB de RAM y funciona en cualquier CPU moderna; la latencia media es de ~17 ms por muestra.
- No se requiere GPU para inferencia; el modelo está optimizado para CPU mediante ONNX Runtime.
- La versión FP32 ocupa ~255 MB, por lo que también es viable en CPU, aunque con mayor latencia (~28 ms).
- Despliegue recomendado con ONNX Runtime (CPUExecutionProvider) o mediante la librería `transformers` con el tokenizador de DistilBERT.
- No se menciona compatibilidad con vLLM, Ollama o TGI; al ser un modelo ONNX de clasificación, se integra fácilmente en servicios Python o en entornos edge.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de discurso de odio (por ejemplo, HateBERT, ToxicBERT o modelos multilingües como XLM-R). La model card no incluye benchmarks ni comparaciones, y la búsqueda web no arrojó resultados relevantes. Por tanto, no es posible establecer una comparativa objetiva en este momento.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no es aplicable a otros idiomas sin reentrenamiento.
- La longitud de contexto está limitada a 128 tokens, por lo que textos más largos deben truncarse, lo que puede perder información relevante.
- El dataset de entrenamiento (Davidson et al., 2017) puede contener sesgos inherentes en la anotación de discurso de odio, especialmente en cuanto a variaciones dialectales o contextos culturales.
- Existe riesgo de falsos positivos (clasificar lenguaje coloquial o sarcasmo como odio) y falsos negativos (no detectar odio implícito o codificado).
- La licencia CC0-1.0 permite uso libre, pero el modelo no garantiza precisión absoluta; se recomienda supervisión humana en aplicaciones de moderación crítica.
- No se han publicado métricas de rendimiento (F1, precisión, recall) sobre el conjunto de test, por lo que su eficacia real no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Isa0/hatespeech
- Dataset subyacente (Davidson et al., 2017): cita en la model card (proceedings de ICWSM '17, páginas 512-515). No se proporciona URL directa.
- No se encontraron otros enlaces (papers, blogs, repositorios) en la búsqueda web.
