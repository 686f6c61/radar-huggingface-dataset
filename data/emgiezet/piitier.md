# emgiezet/piitier

## Resumen

piitier es un modelo de clasificación de tokens basado en ModernBERT, afinado por el usuario emgiezet para la detección y el enmascaramiento de datos personales (PII) en textos en polaco. Resuelve un problema concreto: localizar identificadores sensibles (PESEL, IBAN, NIP, números de tarjeta, datos clínicos, direcciones, nombres, etc.) en documentos de seguros, banca y sanidad para cumplir con el RGPD. El modelo reconoce 39 tipos de entidad codificados como 79 etiquetas BIO y se distribuye con licencia Apache 2.0.

El modelo parte del checkpoint multilingüe bardsai/eu-pii-anonimization-multilang-v2 y se ha afinado en tres etapas sucesivas sobre datos sintéticos, con un total de 2.200 pasos en la versión final. Cuenta con 307.590.991 parámetros y un repositorio de 2,8 GB, e incluye pesos en safetensors (FP32) y exportaciones ONNX en FP32 e INT8.

Su relevancia práctica radica en que combina el modelo NER con una capa de reglas (validación de checksums para identificadores como PESEL, IBAN o NIP) dentro del paquete `piitier`, lo que reduce los falsos negativos en identificadores estructurados. Es un modelo especializado, no generalista: solo cubre polaco y su función es el enmascaramiento, no la seudonimización con sustitutos consistentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertForTokenClassification (transformer encoder) |
| Parametros totales | 307.590.991 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (safetensors y ONNX), INT8 (ONNX con cuantización dinámica, 310 MB) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (FP32 e INT8) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT configurado para clasificación de tokens, con una cabeza que emite 79 etiquetas BIO (78 etiquetas B-/I- más O) correspondientes a 39 tipos de entidad. La lineage documentada por el autor es la siguiente: parte de bardsai/eu-pii-anonimization-multilang-v2 (revisión 5e61416e77675881185767fc0c67759d48b35592), se afina primero como pii-5-v3 sobre 19.637 documentos sintéticos durante 1.300 pasos, después como pii-5-v4a añadiendo 4.000 documentos médicos durante 2.200 pasos, y finalmente como pii-5-v4 (el modelo publicado) sobre 23.637 documentos más 4.000 documentos contrastivos, también durante 2.200 pasos.

El entrenamiento se basa íntegramente en datos sintéticos generados internamente (data/synthetic/v0.3, v0.3-medical y v0.3-medical-contrast), no se documenta el uso de RLHF ni DPO, y no se especifica el número total de tokens de entrenamiento. El umbral de decisión se calibró en 0,78 sobre un split sintético de 1.031 documentos y 14.766 spans de referencia. La exportación INT8 se sometió a una puerta de calidad: la caída de recall respecto a FP32 es de 0,0054, dentro de la tolerancia de 0,01, mientras que la versión anterior (pii-5-v3) no superó esa misma puerta con una caída de 0,018.

## Capacidades

- Detección de PII en texto polaco con 39 tipos de entidad: identificadores fiscales y administrativos (PESEL, NIP, REGON, NR_DOWODU, NR_PASZPORTU, NR_PRAWA_JAZDY, NR_REJESTRACYJNY, VIN), financieros (IBAN, NR_KARTY, CVV, NR_RACHUNKU, KWOTA, DOCHOD), sanitarios (DANE_ZDROWOTNE, ICD10, LEK, LEKARZ, NPWZ, ROZPOZNANIE, PLACOWKA), de contacto y localización (EMAIL, TELEFON, IP, ADRES, GEO, MIEJSCOWOSC, KOD_POCZTOWY) y de identidad (IMIE, NAZWISKO, OSOBA, DATA_URODZENIA, PLEC, WIEK).
- Clasificación de tokens a nivel de span con etiquetado BIO y agregación configurable.
- Enmascaramiento de spans detectados mediante el paquete `piitier`, que añade una capa de reglas con validación de checksums y una estrategia de fusión ponderada por riesgo.
- Exportación ONNX FP32 e INT8 para despliegue sin dependencia de PyTorch.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo discriminativo de clasificación, no generativo.
- No cubre visión, audio ni documentos escaneados sin OCR.

## Casos de uso

- Anonimización de siniestros y pólizas en aseguradoras: el modelo detecta NR_POLISY, NR_SZKODY, NR_UMOWY, NR_REJESTRACYJNY y VIN en texto libre, y la capa de reglas valida los identificadores con checksum antes de enmascararlos.
- Cumplimiento del RGPD en banca: enmascaramiento de IBAN, NR_KARTY, CVV y NR_RACHUNKU en comunicaciones y registros de atención al cliente, con exportación ONNX INT8 para ejecución en infraestructura sin GPU.
- Desidentificación de historiales clínicos: detección de DANE_ZDROWOTNE, ICD10, LEK, LEKARZ, NPWZ, ROZPOZNANIE y PLACOWKA en notas médicas en polaco antes de su uso en investigación o análisis secundario.
- Preprocesado de corpus para entrenamiento: limpieza de PII en conjuntos de datos en polaco antes de publicarlos o de reutilizarlos en pipelines de aprendizaje automático.
- Enmascaramiento en flujos de atención al cliente: integración del pipeline de token-classification en un servicio previo al almacenamiento de transcripciones, filtrando spans con score ≥ 0,78.
- Revisión asistida de contratos y formularios: extracción y enmascaramiento de NR_DOKUMENTACJI, NR_KW, NR_UMOWY y datos de identidad en documentos administrativos, con revisión humana posterior dado que el modelo no está pensado para anonimización totalmente autónoma.
- Auditoría de fugas de datos: uso de las métricas de "Leaked docs" y "Leaked values" del bench para verificar que ningún valor sensible permanece tras el enmascaramiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| Strict Micro Precision | PL-PII-Bench v1 dev | 0,6383 |
| Strict Micro Recall | PL-PII-Bench v1 dev | 0,7500 |
| Strict Micro F1 | PL-PII-Bench v1 dev | 0,6897 |
| Partial Micro F1 | PL-PII-Bench v1 dev | 0,7586 |
| Risk-weighted Recall | PL-PII-Bench v1 dev | 0,7744 |
| Leaked docs | bench/v1/dev | 0 |
| Leaked values | bench/v1/dev | 0 |

Evaluación sobre el split sintético de calibración (1.031 documentos, 14.766 spans, umbral 0,78):

| Metrica | Valor |
|---|---|
| Strict Recall | 0,9866 (IC 95% Wilson: 0,9846-0,9883) |
| Strict Precision | 0,9711 |

Rendimiento de las exportaciones sobre data/synthetic/v0.3/dev.jsonl (2.363 documentos, umbral 0,78):

| Formato | Strict F1 | Recall |
|---|---|---|
| ONNX FP32 | 0,9832 | 0,9868 |
| ONNX INT8 | 0,9745 | 0,9814 |

## Requisitos de hardware

- Con 307,6 millones de parámetros, la inferencia en FP32 requiere aproximadamente 1,2 GB de memoria para los pesos, más el overhead de activaciones y tokenizador; en la práctica, entre 2 y 3 GB de VRAM o RAM.
- La exportación ONNX INT8 ocupa 310 MB, por lo que cabe holgadamente en CPU y en GPU de consumo con 4 GB o más (RTX 3050, RTX 4060, etc.).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32; para lotes grandes o alto throughput, A100, H100, L4 o RTX 4090.
- Despliegue: transformers con pipeline de token-classification, ONNX Runtime (FP32 o INT8), o el paquete `piitier` con CLI y API de Python. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- No se han publicado datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| emgiezet/piitier | 307,6 M | no disponible | pl | Apache 2.0 | NER de PII + capa de reglas |
| bardsai/eu-pii-anonimization-multilang-v2 | no disponible | no disponible | multilingüe | no disponible | NER de PII multilingüe (modelo base) |
| Modelos NER genéricos tipo XLM-R base | ~278 M | 512 tokens | multilingüe | MIT / Apache 2.0 según variante | NER general, requiere afinamiento para PII |

No se dispone de resultados de benchmarks comparables entre piitier y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre polaco; el rendimiento en otros idiomas no está garantizado ni evaluado.
- El modelo enmascara spans, pero no implementa seudonimización con sustitutos consistentes ni numeración de correferencia: cada span se numera de forma independiente.
- No detecta cuasi-identificadores (combinaciones de atributos no PII que en conjunto identifican a una persona).
- No procesa PII no textual: imágenes ni PDF escaneados sin OCR.
- El autor declara explícitamente que no debe usarse en pipelines de anonimización totalmente autónomos sin revisión humana.
- El entrenamiento se basa en datos sintéticos; el rendimiento sobre documentos reales puede diferir del reportado en el split sintético (Strict F1 de 0,6897 en PL-PII-Bench v1 dev frente a 0,9866 de recall en calibración sintética).
- Riesgo de alucinación de spans: el modelo puede marcar como PII fragmentos que no lo son (precisión estricta de 0,6383 en el bench público) o dejar pasar identificadores no estructurados.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para cumplimiento normativo; la responsabilidad del cumplimiento del RGPD recae en el implementador.
- El uso directo con `transformers` omite la capa de reglas y el renderizador, lo que puede degradar la detección de identificadores con checksum.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emgiezet/piitier
- Modelo base: https://huggingface.co/bardsai/eu-pii-anonimization-multilang-v2
- Repositorio del modelo base (revisión fijada): https://huggingface.co/bardsai/eu-pii-anonimization-multilang-v2/tree/5e61416e77675881185767fc0c67759d48b35592
