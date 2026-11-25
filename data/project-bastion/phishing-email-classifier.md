# Project-Bastion/phishing-email-classifier

## Resumen

Project-Bastion/phishing-email-classifier es un clasificador binario de correos de phishing desarrollado por Project-Bastion. Se trata de un fine-tune de distilroberta-base con 82.119.938 parámetros (un encoder transformer de tipo RoBERTa destilado) especializado en distinguir correos legítimos de intentos de phishing a partir únicamente del texto del asunto y el cuerpo del mensaje. El modelo resuelve un problema acotado pero crítico en seguridad del correo electrónico: la detección de ingeniería social textual, complementaria a los filtros basados en reputación de URL, cabeceras o adjuntos.

Su relevancia actual reside en dos factores. Por un lado, declara una AUROC de 0,9998 en CEAS_08 y 0,9997 en TREC_07, con tasas de falsos positivos del 0,2-0,3 % sobre correo legítimo en el umbral por defecto, frente al 10,2-18,5 % de alternativas abiertas ampliamente descargadas. Por otro, se distribuye también en ONNX (int8 de 86 MB y fp32 de 329 MB), lo que permite ejecución local en CPU o en el navegador mediante transformers.js sin enviar el contenido del correo a un servidor, un requisito habitual en entornos con datos sensibles.

El modelo es monolingüe (inglés), procesa los primeros 256 tokens y no analiza URLs, cabeceras ni adjuntos. La licencia es Apache-2.0 y el repositorio ocupa 0,7 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, base distilroberta-base) para clasificación de secuencias |
| Parámetros totales | 82.119.938 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (truncado en el ejemplo de uso de la model card) |
| Tipos de cuantización | ONNX weight-only int8 (86 MB) y ONNX fp32 (329 MB); pesos PyTorch en safetensors |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (model.onnx fp32, model_quantized.onnx int8) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de la familia RoBERTa en su variante destilada (distilroberta-base), con una cabeza de clasificación de secuencias de dos etiquetas: 0 = legítimo, 1 = phishing. La entrada se construye concatenando asunto y cuerpo con un salto de línea (`f"{subject}\n{body}"`), truncando a 256 tokens. La salida relevante en producción no es la probabilidad softmax sino el margen de logits (logit de phishing menos logit de legítimo), donde 0 equivale a p = 0,5; el autor recomienda subir el umbral para reducir falsos positivos.

Los datos de entrenamiento declarados son: locuoco/the-biggest-spam-ham-phish-email-dataset-300000 (MIT), Dizzzy0x00/LLMGen-Phishing-Email-Dataset (Apache-2.0) y los *Phishing Email Curated Datasets* de Champa, Rabbi y Zibran (2023, Zenodo, CC-BY-4.0) a través de kudzaiprichard/aura-phishing-email-corpus. El conjunto zefang-liu/phishing-email-dataset (LGPL-3.0) se usa solo para evaluación. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador de este tipo, pero no se detalla el procedimiento de ajuste fino, la función de pérdida ni la estrategia de balanceo de clases).

Como innovación práctica destaca la paridad numérica entre backends: el autor afirma que el ONNX fp32 produce las mismas decisiones que PyTorch en 315 correos comprobados, y que el int8 mantiene las mismas decisiones con una diferencia máxima de margen de 0,43.

## Capacidades

- Clasificación binaria de texto de correo electrónico en legítimo frente a phishing, con salida de logits y margen calibrable.
- Detección de ingeniería social textual: urgencia, suplantación de identidad, solicitudes de credenciales y datos de tarjeta.
- Detección de phishing generado por LLM: 0,9984 de AUROC en LLMGen-Phishing-Email-Dataset, frente a 0,6948 y 0,5147 de los modelos comparados.
- Ejecución en CPU sin GPU, con latencia propia de un encoder de 82M de parámetros.
- Ejecución íntegra en el navegador mediante transformers.js y ONNX int8 (aproximadamente 86 MB descargados una vez), sin salida de datos del dispositivo.
- Integración con el ecosistema transformers (`AutoTokenizer`, `AutoModelForSequenceClassification`) y con text-embeddings-inference según los tags del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Filtrado previo en pasarelas de correo (MTA/SEG): el modelo puntúa asunto y cuerpo en los primeros 256 tokens y devuelve un margen de logits; con un umbral ajustado se usa como señal adicional antes de la cuarentena, aprovechando su tasa de falsos positivos del 0,2-0,3 % sobre correo legítimo en CEAS_08, TREC_07 y locuoco.
- Clasificación en el cliente de correo sin servidor: empaquetado con transformers.js y el ONNX int8 de 86 MB, permite advertir al usuario en el propio navegador sin que el contenido del mensaje salga del dispositivo, requisito habitual en sectores regulados.
- Detección de campañas de phishing escrito por LLM: el modelo mantiene 0,9984 de AUROC en LLMGen-Phishing-Email-Dataset, escenario en el que los clasificadores abiertos más descargados caen a 0,6948 y 0,5147, por lo que es adecuado para triaje de correos generados automáticamente.
- Segunda opinión sobre correo reportado por usuarios: se puntúa el mensaje reportado y se enruta a análisis humano solo si el margen supera el umbral, reduciendo la carga del equipo SOC.
- Enriquecimiento de pipelines de threat intelligence: el margen de logits se agrega como feature numérico junto a señales de URL y cabeceras en un modelo de decisión de nivel superior.
- Evaluación y regresión de filtros antiphishing: al ser un clasificador pequeño y determinista, sirve como referencia en tests automatizados que comparan el comportamiento de distintos filtros sobre un corpus fijo.
- Detección de fraude nigeriano y estafas por correo: 0,9994 de AUROC y 0,997 de recall a 1 % de FPR en el conjunto Nigerian fraud (649 correos).

## Benchmarks y rendimiento

Resultados declarados por el autor (AUROC; entre paréntesis, recall a 1 % de tasa de falsos positivos). Todos los modelos se puntuaron con el mismo código sobre los mismos correos.

| Benchmark (correos) | phishing-email-classifier | cybersectony/phishing-email-detection-distilbert_v2.4.1 | ptouch/phishing-distilbert-cyber207 |
|---|---|---|---|
| CEAS_08 (3.392) | 0,9998 (0,997) | 0,9847 (0,610) | 0,9669 (0,499) |
| TREC_07 (5.235) | 0,9997 (0,999) | 0,9630 (0,608) | 0,8906 (0,470) |
| Nazario (299) | 0,9984 (0,993) | 0,9317 (0,081) | 0,9079 (0,169) |
| Nigerian fraud (649) | 0,9994 (0,997) | 0,9897 (0,879) | 0,9940 (0,968) |
| locuoco spam-ham-phish, phish vs ham (16.529) | 1,0000 (1,000) | 0,9686 (0,568) | 0,9457 (0,057) |
| LLMGen-Phishing-Email-Dataset (676) | 0,9984 (0,996) | 0,6948 (0,089) | 0,5147 (0,052) |
| SpamAssassin (565) | 0,9973 (0,945) | 0,9976 (0,951) | 0,9996 (0,982) |
| zefang-liu/phishing-email-dataset (17.236) | 0,7752 (0,356) | 0,9998 (0,998) | 0,9884 (0,866) |

Tasas de falsos positivos sobre correo legítimo en el umbral por defecto (margen 0): 0,3 % en CEAS_08, 0,2 % en TREC_07 y 0,3 % en locuoco, frente a 10,2 %, 10,2 % y 18,5 % para cybersectony. Las métricas de la model-index están marcadas como no verificadas (`verified: false`). El autor advierte que las etiquetas de CEAS_08 y TREC_07 marcan spam como phishing según se publicaron.

## Requisitos de hardware

- VRAM para inferencia: menos de 1 GB en fp32 (82M de parámetros, aproximadamente 329 MB de pesos más activaciones para lotes pequeños); el ONNX int8 ocupa 86 MB.
- GPU recomendadas: no requiere GPU; funciona en CPU. En GPU, cualquier tarjeta con al menos 1-2 GB de memoria libre es suficiente (GTX 1650, RTX 3060, T4, A100, H100), sin que el modelo aproveche el excedente de cómputo.
- Cabe en cualquier GPU de consumo e incluso en dispositivos de gama baja y en el navegador.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, transformers.js en navegador, text-embeddings-inference (según tags). vLLM, llama.cpp, Ollama y TGI no son aplicables a un clasificador encoder de este tipo.
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada; el orden de magnitud esperado para un encoder de 82M con entrada de 256 tokens es de milisegundos por correo en CPU moderna, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AUROC CEAS_08 | AUROC LLMGen | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Project-Bastion/phishing-email-classifier | 82,1M | 256 tokens | 0,9998 | 0,9984 | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| cybersectony/phishing-email-detection-distilbert_v2.4.1 | no disponible | no disponible | 0,9847 | 0,6948 | no disponible en la información | Hugging Face (312k descargas) |
| ptouch/phishing-distilbert-cyber207 | no disponible | no disponible | 0,9669 | 0,5147 | no disponible en la información | Hugging Face (248k descargas) |

El modelo supera a ambos comparadores en seis de los ocho conjuntos evaluados, con especial ventaja en LLMGen-Phishing (0,9984 frente a 0,6948 y 0,5147) y en recall a 1 % de FPR en Nazario (0,993 frente a 0,081 y 0,169). Pierde de forma clara en zefang-liu/phishing-email-dataset (0,7752 frente a 0,9998 y 0,9884) y queda por detrás en SpamAssassin (0,9973 frente a 0,9996 de ptouch). Los parámetros y contextos de los comparadores no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento degradado en zefang-liu/phishing-email-dataset: 0,7752 de AUROC frente a 0,9998 del modelo de cybersectony. El autor recomienda evaluar sobre el correo propio y ajustar el umbral antes de confiar en el modelo.
- Solo texto en inglés y solo los primeros 256 tokens del mensaje; los correos largos se truncan y pueden perder la señal relevante.
- No analiza URLs, cabeceras, adjuntos ni metadatos de remitente, que son vectores habituales de phishing; debe combinarse con otras señales.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de errores de clasificación: un falso negativo deja pasar el correo y un falso positivo bloquea correo legítimo. La tasa declarada de falsos positivos es del 0,2-0,3 % en los conjuntos indicados, no una garantía en dominios distintos.
- Sesgos conocidos: no se documentan análisis de sesgo en la información disponible. El entrenamiento con corpus públicos de spam y phishing puede sobrerrepresentar ciertos estilos y dominios.
- Etiquetado de los benchmarks: CEAS_08 y TREC_07 marcan spam como phishing, de modo que las métricas miden detección de spam-phishing en sentido amplio, no solo fraude de credenciales.
- Licencia Apache-2.0, permisiva para uso comercial; el modelo base distilroberta-base también es Apache-2.0. Los datos de entrenamiento tienen licencias MIT, Apache-2.0 y CC-BY-4.0, y el conjunto de evaluación zefang-liu es LGPL-3.0 (solo evaluación).
- Para producción: calibrar el umbral con correo propio, monitorizar la deriva del corpus y no usar el modelo como único control de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Project-Bastion/phishing-email-classifier
- Demo en el navegador (Space): https://huggingface.co/spaces/Project-Bastion/phishing-email-classifier-demo
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Dataset de entrenamiento locuoco: https://huggingface.co/datasets/locuoco/the-biggest-spam-ham-phish-email-dataset-300000
- Dataset de entrenamiento LLMGen: https://huggingface.co/datasets/Dizzzy0x00/LLMGen-Phishing-Email-Dataset
- Corpus derivado aura-phishing-email-corpus: https://huggingface.co/datasets/kudzaiprichard/aura-phishing-email-corpus
- Dataset de evaluación zefang-liu: https://huggingface.co/datasets/zefang-liu/phishing-email-dataset
- Paper de los corpus curados (Champa, Rabbi y Zibran, 2023), Zenodo: https://doi.org/10.5281/zenodo.8339691
- Modelo comparado cybersectony: https://huggingface.co/cybersectony/phishing-email-detection-distilbert_v2.4.1
- Modelo comparado ptouch: https://huggingface.co/ptouch/phishing-distilbert-cyber207
