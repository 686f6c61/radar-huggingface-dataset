# euhidaman/neon-inspection-autovi

## Resumen

Neon inspection — AutoVI pipe staples es un modelo de inspección visual industrial publicado por el usuario euhidaman bajo el sello Zevion Labs. No es un modelo de lenguaje generativo de propósito general, sino un sistema image-to-text de dominio muy restringido: recibe una fotografía de la zona de grapas de retención de tuberías en ensamblajes de automoción y devuelve una frase corta de inspección junto con una decisión PASS, REJECT o UNCERTAIN. Está entrenado específicamente sobre la categoría `pipe_staple` del conjunto de datos AutoVI, procedente de líneas de producción de Renault.

Técnicamente, el modelo combina un codificador convolucional MobileNetV2 (alpha 0.35) congelado e inicializado con ImageNet, truncado en la expansión del bloque 13, con un decodificador GRU condicionado por imagen e instrucción, entrenado desde cero y de apenas 257.961 parámetros. La entrada es RGB de 224 × 224 y la salida se limita a 24 tokens sobre un vocabulario de 41. El payload compilado en INT8 ocupa aproximadamente 0,58 MB, lo que lo sitúa en la categoría de modelos desplegables en hardware embebido como Coral.

Su relevancia es doble: por un lado, ejemplifica el paradigma de modelos tiny especializados para inspección industrial en el borde; por otro, su propia model card es explícita sobre sus limitaciones: ambas releases fallaron los criterios de aceptación de calidad del proyecto, la inferencia física en placa Coral no se ha verificado y el rendimiento real en el conjunto de test es modesto, con 145 de 305 imágenes derivadas a revisión humana. Debe tratarse, por tanto, como una pieza de investigación reproducible y no como un sistema de control de calidad validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (MobileNetV2 alpha 0.35, bloque 13) + decodificador GRU condicionado por imagen e instrucción |
| Parámetros totales | 257.961 (solo decodificador; codificador congelado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (máximo 24 tokens de salida, vocabulario de 41 tokens) |
| Tipos de cuantización | INT8 en codificador y matrices del decodificador por filas; aritmética y activaciones del decodificador en FP32 |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | TFLite (payload compilado de ~0,58 MB); pesos de referencia incluidos en el repositorio |
| Entrada | Imagen RGB 224 × 224 |
| Salida | Frase corta + decisión PASS / REJECT / UNCERTAIN |
| Tamaño del payload desplegado | ~0,58 MB |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un pipeline híbrido CNN-GRU. El codificador es un MobileNetV2 con factor de anchura 0.35, inicializado con pesos de ImageNet y congelado durante el entrenamiento, truncado en la expansión del bloque 13; procesa la imagen de 224 × 224 y produce un vector de características. Sobre esas características, y condicionado por una instrucción textual, opera un decodificador GRU entrenado desde inicialización aleatoria que genera la frase de inspección token a token, con un vocabulario de 41 tokens y un máximo de 24 tokens de salida. No se trata de un fine-tuning de un modelo fundacional Neon, sino de un decodificador nuevo entrenado específicamente para esta tarea.

El entrenamiento utilizó 191 imágenes normales de origen, divididas en 153 de entrenamiento y 38 de validación antes de la aumentación. Las vistas de entrenamiento contienen anomalías sintéticas explícitas; las 117 anomalías reales del conjunto de test no se emplearon como ejemplos de entrenamiento. El decodificador se entrenó con 1.530 vistas aumentadas de entrenamiento y 228 de validación. Las frases de supervisión se derivaron de las etiquetas y anotaciones del conjunto de datos AutoVI. La cuantización es mixta: INT8 en el codificador y en las matrices del decodificador por filas, manteniendo FP32 en la aritmética y activaciones del decodificador; el autor subraya explícitamente que no es un modelo totalmente entero ni de 1,58 bits.

## Capacidades

- Inspección visual de una vista concreta de ensamblaje: la zona de grapas de retención de tuberías (`pipe_staple`).
- Generación de una frase corta de inspección en inglés a partir de la imagen y una instrucción.
- Emisión de una decisión discreta: PASS (sin defecto detectado), REJECT (defecto detectado) o UNCERTAIN (requiere revisión humana).
- Modos de informe soportados: `summary` y `location`.
- Verificación de política y confianza que puede retener la decisión aunque la frase generada suene categórica.
- Ejecución local sin GPU tras la descarga inicial y la instalación de dependencias.
- SDK en Python (`neon_sdk.coral_inspection`) para carga del paquete e inferencia programática.
- CLI de vigilancia de directorio (`neon_inspect.py --watch`) para procesar llegadas continuas de ficheros y volcar resultados a JSONL.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento. No es un VLM de propósito general.

## Casos de uso

- Verificación de primera pieza en línea de montaje: el modelo puede procesar una foto de la zona de grapas y emitir una decisión PASS/REJECT/UNCERTAIN antes de liberar el lote, actuando como filtro rápido de bajo coste computacional en el propio puesto.
- Triaje previo a inspección humana: dado que 145 de 305 imágenes de test se derivaron a UNCERTAIN, el modelo encaja como primera etapa que descarta casos claros y escala el resto a un operario, reduciendo el volumen de revisión manual.
- Despliegue en hardware embebido de borde: con un payload de ~0,58 MB en INT8 y sin necesidad de GPU, es candidato a ejecutarse en dispositivos tipo Coral o en un Linux x86-64 de bajos recursos junto a la cámara de la línea.
- Monitorización por lotes de archivos entrantes: mediante `neon_inspect.py --watch --directory`, se puede integrar en un pipeline que consuma imágenes conforme llegan y registre cada resultado en `inspection.jsonl` para auditoría posterior.
- Investigación y reproducción de pipelines tiny de inspección: el repositorio incluye SDK, pesos de referencia, firmware, fixtures, evidencia de entrenamiento y herramientas de despliegue, lo que permite reproducir y auditar el flujo completo.
- Prototipado de sistemas image-to-text condicionados por instrucción en dominios industriales restringidos: sirve como base metodológica para adaptar el esquema CNN congelada + decodificador GRU a otras categorías de defecto con pocos datos.
- Generación de trazas estructuradas para MES/ERP: la salida JSON con `raw_generated` y `decision` puede alimentar registros de calidad, siempre con supervisión humana dado el nivel de falsos positivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí proporciona resultados sobre las 305 imágenes oficiales de test de la categoría, en modo `location` y comparando únicamente presencia de defecto:

| Resultado | Imágenes |
|---|---:|
| Detecta correctamente un defecto | 43 |
| Identifica correctamente ausencia de defecto | 55 |
| Pasa por alto un defecto | 17 |
| Falsa alarma | 45 |
| Requiere revisión humana | 145 |

El autor advierte que la detección correcta de defecto no garantiza que la ubicación generada sea correcta, y que el modelo no produce máscara de segmentación ni caja delimitadora del defecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo no requiere GPU. El payload desplegado es de ~0,58 MB en INT8.
- GPU recomendadas: ninguna. El host soportado es Linux x86-64 con Python 3.11.
- ¿Cabe en GPU de consumo? Sí, pero es irrelevante: está diseñado para ejecución en CPU y para hardware embebido tipo Coral. La inferencia física en placa Coral no ha sido verificada por el autor.
- Otros hosts requieren una compilación validada de las librerías nativas.
- Opciones de despliegue: SDK Python incluido (`neon_sdk.coral_inspection`), CLI `neon_inspect.py` con modo `--watch`, y el script `run.py` para inferencia puntual con modos `summary` y `location`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de entorno: en Nibi, la inferencia debe ejecutarse dentro de una asignación Slurm. No deben escribirse ficheros nuevos dentro de `package/`, ya que el SDK verifica el inventario completo y los hashes.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (inspección industrial tiny image-to-text) con parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ámbito estrictamente limitado a la categoría `pipe_staple`; no es un VLM de propósito general ni un sistema de control de calidad industrial probado.
- El propio autor indica que ambas releases fallaron los criterios de aceptación de calidad del proyecto.
- La inferencia física en placa Coral no ha sido verificada; solo se ha ejecutado inferencia en host.
- Tasa elevada de derivación a revisión humana (145 de 305 en test) y de falsas alarmas (45 de 305), con 17 defectos no detectados.
- No identifica el tipo de defecto de forma fiable ni propone una reparación; no devuelve máscara de segmentación ni caja delimitadora.
- Riesgo de alucinación en la frase generada: la comprobación de confianza y política puede retener la decisión aunque el texto suene categórico.
- Las acciones de controlador son simuladas, no instrucciones para maquinaria real.
- Entrenamiento con anomalías sintéticas y solo 153 imágenes de entrenamiento antes de aumentación; posible brecha de dominio respecto a condiciones reales de línea.
- Idioma de salida únicamente inglés.
- Licencia no disponible: no se puede confirmar el uso comercial. Las imágenes de ejemplo de AutoVI están bajo CC BY-NC-SA 4.0, lo que restringe el uso comercial de ese material.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación externa por parte de la comunidad.
- Restricciones operativas del paquete: no escribir dentro de `package/` por la verificación de hashes e inventario del SDK.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/euhidaman/neon-inspection-autovi
- Demo: https://zevion-neon-inspection.netlify.app/?v=4
- Conjunto de datos AutoVI (Zenodo): https://zenodo.org/records/10459003
- Licencia CC BY-NC-SA 4.0: https://creativecommons.org/licenses/by-nc-sa/4.0/
