# jonprompter/LagerPilot-Qwen2.5-0.5B-LoRA

## Resumen

LagerPilot-Qwen2.5-0.5B-LoRA es un ajuste fino mediante LoRA del modelo Qwen2.5-0.5B-Instruct, desarrollado por el usuario jonprompter y publicado en HuggingFace. Está especializado en logística de almacén alemana, concretamente en la recepción de mercancías (Wareneingang) y en el cumplimiento del artículo 377 del Código de Comercio alemán (HGB), que regula los plazos de reclamación por defectos en la entrega. El modelo busca resolver un problema legal y financiero concreto: la pérdida de derechos de garantía cuando no se objeta formalmente una entrega defectuosa dentro de los plazos establecidos.

El modelo parte de la arquitectura transformer densa de Qwen2.5-0.5B-Instruct, con 0,5 mil millones de parámetros, y se distribuye como adaptador LoRA sobre el modelo base. Está pensado para ejecutarse íntegramente en local sobre hardware de borde de bajo coste (mini-PC, NUC, terminales de almacén), sin dependencia de la nube y con cumplimiento del RGPD. Sus idiomas de trabajo son el alemán y el inglés.

La relevancia del modelo radica en su enfoque vertical: no compite en capacidades generales, sino que cubre un flujo operativo muy específico (OCR de albaranes, conversión de unidades de embalaje, decisiones de tres niveles semaforizados y generación de reclamaciones legales formales, además de payloads para SAP MIGO). En el momento de la consulta, el repositorio registra 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere que los pesos del adaptador podrían no estar efectivamente subidos o que el repositorio es meramente descriptivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parámetros totales | 0,5 mil millones (modelo base); parámetros del adaptador LoRA no disponibles |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32 768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Alemán (de), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA); pesos del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5 mil millones de parámetros. El ajuste se realiza mediante LoRA (Low-Rank Adaptation), técnica que congela los pesos del modelo base e introduce matrices de baja dimensión entrenables, lo que reduce drásticamente los requisitos de memoria y cómputo durante el entrenamiento y permite distribuir únicamente el adaptador. No se especifican en la información disponible el rango de LoRA, el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La model card describe una pipeline de inferencia con guardrails que combina tres fuentes de entrada: OCR de albaranes (PDF/EDI), pedidos de compra del ERP (SAP o proALPHA) y notas de rampa con escaneo de códigos GS1-128 o VDA 4902. El modelo produce conversiones de unidades de embalaje (Kartons/Gebinde a Stück), decisiones semaforizadas de tres niveles (FREIGABE, MÄNGELRÜGE_ERFORDERLICH, SPERRE), notificaciones formales de objeción bajo el § 377 HGB y el § 439 BGB, y payloads de movimiento para SAP MIGO (BAPI_GOODSMVT_CREATE con tipos 101, 103 y 122). No se detallan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en alemán e inglés, orientada a tareas de recepción de mercancías.
- Conversión determinista de unidades de embalaje (cajas, envases, unidades) a piezas.
- Clasificación de entregas en tres estados: liberación (FREIGABE), reclamación por defecto (MÄNGELRÜGE_ERFORDERLICH) y bloqueo (SPERRE).
- Generación de notificaciones legales formales de objeción bajo el § 377 HGB y el § 439 BGB en alemán.
- Producción de payloads para SAP MIGO mediante BAPI_GOODSMVT_CREATE (movimientos 101, 103 y 122).
- Manejo de escenarios de defectos: faltantes, excesos, sustitución no autorizada (Aliud), daños en transporte, caducidad (MHD), certificados de calidad ausentes (EN 10204 3.1), mercancías peligrosas (ADR/GGVSEB/REACH) y entregas a destinatario erróneo.
- Procesamiento de entregas multilínea con resolución parcial por línea.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque la generación de payloads BAPI sugiere una salida estructurada.
- Capacidades de agente multi-paso: no confirmadas en la información disponible.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto y depende de OCR externo.

## Casos de uso

- **Auditoría de recepción de mercancías en almacén**: el modelo compara el albarán OCR con el pedido de compra del ERP y emite una decisión semaforizada. Es adecuado por su especialización en conversión de unidades y en la lógica del § 377 HGB, y puede ejecutarse en un terminal de rampa sin conexión a la nube.

- **Generación automática de reclamaciones legales**: ante un faltante, una sustitución no autorizada o un daño en transporte, el modelo redacta una notificación formal en alemán conforme al § 377 HGB. Resulta idóneo para pymes industriales que carecen de departamento jurídico propio y necesitan cumplir plazos estrictos.

- **Integración con SAP MIGO**: el modelo produce payloads BAPI_GOODSMVT_CREATE para movimientos 101 (entrada a libre utilización), 103 (bloqueo en lugar de clarificación) y 122 (devolución o rechazo de admisión). Se usaría como capa de preprocesamiento que traduce hallazgos físicos en movimientos de stock.

- **Clasificación de incidencias de mercancías peligrosas**: ante una fuga de disolvente UN 1219 o la ausencia de ficha de datos de seguridad, el modelo emite estado SPERRE y activa el protocolo de contención ADR/WHG. Es adecuado por su entrenamiento en escenarios de cumplimiento normativo alemán.

- **Control de vida útil y certificados**: el modelo detecta violaciones de fecha de caducidad (MHD) o la falta de certificados de calidad EN 10204 3.1, generando una reclamación con bloqueo de stock. Se integraría en la validación previa a la entrada en almacén.

- **Resolución de entregas multilínea**: en albaranes con varias posiciones, el modelo evalúa cada línea de forma independiente y emite reclamaciones parciales cuando solo algunas presentan defectos. Es útil en almacenes con pedidos complejos y múltiples referencias.

- **Despliegue en terminales de borde sin conectividad**: al ser un modelo de 0,5B parámetros, puede ejecutarse en mini-PC o terminales Zebra con CPU, lo que permite cumplir el RGPD al no enviar datos de proveedores ni precios a servicios externos.

## Benchmarks y rendimiento

La model card reporta un "stress-test" interno de 10 casos de uso con un 100 % de acierto (10/10). No se trata de un benchmark estándar y no se aportan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

| ID | Escenario | Categoría | Estado esperado | Estado real | Aviso § 377 | Resultado |
|:---|:---|:---|:---:|:---:|:---:|:---:|
| UC-01 | Entrada limpia: 20 cajas de 50 uds = 1.000 uds | Conversión VPE | FREIGABE | FREIGABE | No | Aprobado |
| UC-02 | Faltante no anunciado: 420 uds vs 500 pedidas | Defecto de cantidad | MÄNGELRÜGE | MÄNGELRÜGE | Sí (carta) | Aprobado |
| UC-03 | Exceso: 350 uds vs 200 pedidas | Sobrecantidad | MÄNGELRÜGE | MÄNGELRÜGE | Sí (carta) | Aprobado |
| UC-04 | Sustitución no autorizada: Rev B en lugar de Rev A | Especificación (Aliud) | MÄNGELRÜGE | MÄNGELRÜGE | Sí (carta) | Aprobado |
| UC-05 | Daño en transporte: palé aplastado, cajas mojadas | Tránsito físico | MÄNGELRÜGE | MÄNGELRÜGE | Sí (CMR) | Aprobado |
| UC-06 | Fuga de mercancía peligrosa: UN 1219, sin SDS | ADR/GGVSEB/REACH | SPERRE | SPERRE | Sí (bloqueo) | Aprobado |
| UC-07 | Caducidad: 6 semanas restantes vs 12 meses | Calidad/MHD | MÄNGELRÜGE | MÄNGELRÜGE | Sí (carta) | Aprobado |
| UC-08 | Certificado de calidad ausente: EN 10204 3.1 | Defecto de cumplimiento | MÄNGELRÜGE | MÄNGELRÜGE | Sí (stock bloqueado) | Aprobado |
| UC-09 | Entrega errónea del transportista a tercero | Error logístico | SPERRE | SPERRE | Sí (rechazo) | Aprobado |
| UC-10 | Entrega multilínea: líneas 1 y 3 correctas, línea 2 con 5 uds menos | División multiartículo | MÄNGELRÜGE | MÄNGELRÜGE | Sí (parcial) | Aprobado |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 0,5B parámetros, la inferencia en FP16 requiere aproximadamente 1 GB de memoria; en cuantización de 4 bits, por debajo de 0,5 GB. No se especifican cuantizaciones oficiales en la información disponible.
- **GPU recomendadas**: no se indican GPU concretas. El modelo está diseñado para ejecutarse en CPU sobre mini-PC, NUC o terminales Zebra, según la model card.
- **Compatibilidad con GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 3050 o superiores), aunque el enfoque declarado es la ejecución en CPU.
- **Opciones de despliegue**: Docker Compose (recomendado por el autor), Ollama, y presumiblemente llama.cpp y vLLM por compatibilidad con el formato del modelo base, aunque no se confirman en la información disponible.
- **Latencia y throughput**: no disponibles. La model card no aporta cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas en la información proporcionada. Se ofrece una comparación estructural con el modelo base y con alternativas genéricas de tamaño similar, marcando los datos no confirmados.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LagerPilot-Qwen2.5-0.5B-LoRA | 0,5B (base) + adaptador LoRA | No disponible | Logística alemana, § 377 HGB, SAP MIGO | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen2.5-0.5B-Instruct | 0,5B | 32 768 tokens (según modelo base) | Propósito general, instrucciones | Apache 2.0 | HuggingFace (ampliamente descargado) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 tokens (según modelo base) | Propósito general, instrucciones | Apache 2.0 | HuggingFace |
| SmolLM2-360M-Instruct | 0,36B | 8 192 tokens (según modelo base) | Propósito general, instrucciones | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados en la información disponible. Al estar entrenado sobre normativa alemana y un dominio muy específico, puede presentar un sesgo hacia el marco legal alemán y no ser aplicable a otras jurisdicciones.
- **Riesgo de alucinación**: no evaluado con métricas estándar. En un dominio legal y financiero, la generación de referencias normativas o payloads BAPI incorrectos podría tener consecuencias contractuales; se recomienda validación humana antes de enviar reclamaciones o ejecutar movimientos en SAP.
- **Limitaciones de contexto e idioma**: solo se declaran alemán e inglés. La longitud de contexto efectiva del ajuste no se especifica. El modelo no procesa imágenes ni PDFs directamente; depende de una capa OCR externa.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia. No se documentan restricciones adicionales del autor.
- **Caveats para producción**: el repositorio muestra 0 descargas y un tamaño de 0,0 GB, lo que sugiere que los pesos del adaptador podrían no estar disponibles o que el repositorio es una vitrina descriptiva. Antes de desplegar, es imprescindible verificar que los archivos safetensors del adaptador existen y son cargables sobre el modelo base. El "stress-test" de 10 casos es interno y no constituye una validación independiente. La integración con SAP MIGO requiere credenciales y configuración del sistema ERP, no incluidas en el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/jonprompter/LagerPilot-Qwen2.5-0.5B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio GitHub mencionado en la model card: https://github.com/your-username/LagerPilot-Qwen (URL de plantilla, no verificada)
- Texto del § 377 HGB: https://www.gesetze-im-internet.de/hgb/__377.html
- Ollama: https://ollama.com/
- SAP BAPI_GOODSMVT_CREATE: https://sap.com/
