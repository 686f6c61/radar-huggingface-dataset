# mohamedghoul/team-182-wiqaia-levels

## Resumen

Wiqaia-Levels es un clasificador de texto bilingüe (árabe e inglés) desarrollado por el usuario mohamedghoul en el contexto del hackathon qai-hf-hackathon-2026. Su función es estimar el nivel de confidencialidad de un documento según los cinco niveles de la Política Nacional de Clasificación de Datos de Catar: C0 Público, C1 Interno, C2 Restringido, C3 Secreto y C4 Alto Secreto. El modelo se construye sobre `intfloat/multilingual-e5-small` con una cabeza de clasificación de secuencias y cuenta con 117.655.685 parámetros totales.

El modelo está diseñado como la primera capa (Tier 1) de un sistema de guardarraíles llamado Wiqaia. No toma decisiones autónomas: los detectores de entidades sensibles (identificadores cataríes, IBAN, tarjetas, teléfonos, marcas de clasificación) establecen un suelo mínimo y, si el clasificador predice un nivel superior, el texto se escala a una segunda capa basada en un modelo Qwen abierto que lee el texto enmascarado junto con extractos de la política. Esta arquitectura de seguridad en cascada, junto con su capacidad de ejecutarse íntegramente en el navegador mediante Transformers.js y un modelo ONNX cuantizado de 118 MB, lo hace relevante para despliegues de privacidad por diseño donde el texto no abandona el dispositivo.

La relevancia actual del modelo radica en su enfoque de clasificación de datos sensibles sin envío de información a servidores externos, un requisito creciente en entornos regulados. No obstante, todos los datos de entrenamiento y evaluación son sintéticos, por lo que sus métricas miden la concordancia con ejemplos generados por LLM, no con clasificaciones humanas reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) con cabeza de clasificación de secuencias, basado en `intfloat/multilingual-e5-small` |
| Parámetros totales | 117.655.685 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | ONNX cuantizado q8 (`onnx/model_quantized.onnx`, 118 MB); safetensors en precisión completa |
| Idiomas soportados | Árabe (incluido árabe del Golfo) e inglés |
| Licencia | MIT |
| Formato de pesos | Safetensors, ONNX (incluye versión cuantizada q8) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder de tipo BERT, partiendo del checkpoint `intfloat/multilingual-e5-small` al que se añade una cabeza estándar de clasificación de secuencias para cinco clases (C0 a C4). El entrenamiento se realizó durante 6 épocas con una tasa de aprendizaje de 5e-5, una longitud máxima de 256 tokens y selección del mejor epoch según macro-F1 de validación (0.939). El entrenamiento completo se ejecutó en la GPU integrada (MPS) de un portátil en aproximadamente 2 minutos, lo que refleja el reducido coste computacional del modelo.

Los datos de entrenamiento son completamente sintéticos y las etiquetas provienen de las instrucciones del generador, con verificación cruzada por un tercer modelo (gpt-oss-120b); se descartaron las filas en las que la discrepancia superaba un nivel. El conjunto de test (226 documentos) fue generado por una familia de modelos distinta (gemma-3-27b) frente a los datos de entrenamiento (Qwen3-235B), lo que reduce pero no elimina el sesgo de estilo compartido. Se aplicó calibración por escalado de temperatura (T = 0.125) sobre el split de validación, integrada en los pesos del clasificador para que todos los entornos de ejecución obtengan puntuaciones calibradas; en test, el ECE pasó de 0.338 a 0.132 y el NLL de 0.935 a 0.898, sin modificar las predicciones.

## Capacidades

- Clasificación de texto en cinco niveles de confidencialidad (C0 Público, C1 Interno, C2 Restringido, C3 Secreto, C4 Alto Secreto) según la Política Nacional de Clasificación de Datos de Catar.
- Procesamiento bilingüe de árabe (incluido árabe del Golfo) e inglés, con soporte para documentos mixtos.
- Ejecución en el navegador del cliente mediante Transformers.js y el modelo ONNX cuantizado q8, sin envío de texto a servidores externos en esta capa.
- Integración en una arquitectura de guardarraíles en cascada: actúa como Tier 1 y solo escala a Tier 2 cuando su predicción supera el suelo establecido por los detectores de entidades sensibles.
- Puntuaciones calibradas por temperatura integrada en los pesos, lo que permite umbrales de decisión consistentes entre entornos de ejecución.
- Compatibilidad con text-embeddings-inference y endpoints compatibles, además de la librería transformers estándar.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de visión o audio.

## Casos de uso

- Clasificación de confidencialidad en el navegador: el modelo se ejecuta localmente con Transformers.js sobre documentos que el usuario está redactando o revisando, de modo que el contenido sensible no se transmite a ningún servidor durante la primera evaluación.
- Guardarraíl previo a envío de correos o mensajes: antes de que un empleado envíe un documento a un destinatario externo, el clasificador estima su nivel y bloquea o advierte si detecta contenido C2 o superior, complementado por los detectores de entidades.
- Etiquetado automático de repositorios documentales: en pipelines de ingesta, el modelo asigna un nivel preliminar a cada documento para que los responsables de datos lo revisen, reduciendo el trabajo manual en volúmenes grandes.
- Filtrado en asistentes conversacionales corporativos: integrado como Tier 1 de Wiqaia, clasifica los prompts del usuario antes de que se procesen por un LLM de mayor tamaño, escalando los casos dudosos a la capa de texto enmascarado.
- Cumplimiento normativo en entornos cataríes: organizaciones sujetas a la NDCP v3.0 pueden usar el modelo como ayuda para etiquetar borradores según los cinco niveles oficiales, con la clasificación final siempre a cargo del propietario del dato.
- Despliegue en dispositivos con recursos limitados: gracias a su tamaño (118 MB en q8) y a su inferencia en CPU o GPU integrada, puede incorporarse a aplicaciones de escritorio o extensiones de navegador sin infraestructura de servidores.
- Prototipado rápido de sistemas de clasificación de datos sensibles: al entrenarse en minutos y ejecutarse en el navegador, sirve como base para experimentar con políticas de clasificación antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test (226 documentos generados por una familia de modelos distinta a la de entrenamiento):

| Métrica | Valor |
|---|---|
| Macro-F1 | 0.765 (0.731 con ONNX q8) |
| Accuracy | 0.770 |
| Dentro de un nivel | 1.000 |
| Subclasificación (predicción inferior a la etiqueta) | 0.084 |
| Macro-F1 en documentos sin línea de marcado | 0.772 |
| Macro-F1 por idioma | ar 0.763 · ar_gulf 0.776 · en 0.717 · mixed 0.690 |
| F1 por clase | C0 0.806 · C1 0.768 · C2 0.821 · C3 0.639 · C4 0.792 |

Matriz de confusión (filas = etiqueta, columnas = predicción, C0..C4):

```
C0 [29, 11,  0,  0,  0]
C1 [ 3, 43,  3,  0,  0]
C2 [ 0,  9, 39,  1,  0]
C3 [ 0,  0,  4, 23, 18]
C4 [ 0,  0,  0,  3, 40]
```

El principal error es C3 → C4 (sobreclasificación), que en ambos casos bloquea el envío a destinos externos. La calibración por temperatura redujo el ECE en test de 0.338 a 0.132 y el NLL de 0.935 a 0.898.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantización q8 (modelo ONNX de 118 MB); aproximadamente 0.5 GB en fp32 para los pesos safetensors.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, GPU integrada o GPU de portátil (el entrenamiento se realizó en MPS). Cualquier GPU consumer moderna (RTX 3060 o superior) es más que suficiente.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y navegadores.
- Opciones de despliegue: Transformers.js en el navegador (dtype q8), transformers con PyTorch, ONNX Runtime, text-embeddings-inference y endpoints compatibles.
- Latencia y throughput: no se han publicado mediciones específicas de latencia o throughput en la información disponible. El entrenamiento completo en MPS tomó aproximadamente 2 minutos, lo que da una idea del reducido coste computacional.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de clasificación de confidencialidad bilingüe árabe-inglés en la documentación proporcionada. Como referencia, el modelo base `intfloat/multilingual-e5-small` es un encoder multilingüe de 118 millones de parámetros orientado a embeddings, no a clasificación de niveles de confidencialidad, por lo que la comparación directa no es posible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wiqaia-Levels | 117,7 M | 256 tokens | Clasificación C0–C4 (ar/en) | MIT | Hugging Face |
| intfloat/multilingual-e5-small | 118 M | 512 tokens | Embeddings multilingües | MIT | Hugging Face |
| Alternativas de clasificación de confidencialidad | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Todos los datos de entrenamiento y evaluación son sintéticos; las etiquetas provienen de las instrucciones del generador y fueron verificadas por un tercer modelo, no por anotadores humanos. Las métricas miden concordancia con ejemplos escritos por LLM, no con clasificadores oficiales reales.
- El conjunto de test fue generado por gemma-3-27b mientras que el entrenamiento usó Qwen3-235B; esto reduce pero no elimina el sesgo de estilo compartido entre generadores.
- En prompts de chat reales (muestra de WildChat) el modelo sobreclasifica, motivo por el que en Wiqaia solo actúa como capa de escalado y nunca decide por sí solo.
- Las definiciones de nivel siguen un resumen de trabajo del material público de la NDCP v3.0 de NCSA, no el texto oficial de la política.
- No sustituye la clasificación del propietario del dato; una marca aplicada por el propietario tiene precedencia.
- La longitud de contexto está limitada a 256 tokens, insuficiente para documentos largos sin truncado o segmentación previa.
- El rendimiento en inglés (macro-F1 0.717) y en documentos mixtos (0.690) es inferior al de árabe, lo que debe tenerse en cuenta en despliegues multilingües.
- La clase C3 presenta el F1 más bajo (0.639) y concentra el error de sobreclasificación hacia C4.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero la ausencia de validación humana hace recomendable una revisión antes de usarlo en producción regulada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mohamedghoul/team-182-wiqaia-levels)
- [Espacio Wiqaia Portal](https://huggingface.co/spaces/mohamedghoul/team-182-wiqaia-portal)
- [Dataset Wiqaia-Levels](https://huggingface.co/datasets/mohamedghoul/team-182-wiqaia-levels)
- [Modelo base intfloat/multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small)
