# icefireman/injection_classifier_eth

## Resumen

Injection classifier v3.3 es un modelo de clasificación de texto derivado de `Horizon-Labs/prompt-injection-guard-base`, afinado por el usuario icefireman para detectar inyecciones de prompt en documentos OCR (facturas, recibos y documentos de pago) antes de que un modelo de lenguaje los procese. El modelo resuelve un problema concreto de seguridad en pipelines de agentes: un atacante puede incrustar instrucciones maliciosas en el texto de un documento escaneado para secuestrar el comportamiento del lector automático, y este clasificador actúa como filtro previo con dos etiquetas, `SAFE` e `INJECTION`.

Arquitectura ModernBERT con 307.531.778 parámetros totales (aproximadamente 308 M), pesos almacenados en float16 y cargados en float32 por el pipeline. El contexto de entrada está limitado a 40 líneas OCR consecutivas y 1.024 tokens durante el entrenamiento. El repositorio ocupa 0,6 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es práctica: no es un modelo generalista, sino un componente de seguridad integrado en un pipeline concreto (denominado EthereumFoundation pipeline) que se instala mediante un comando propio, verifica los pesos contra un SHA-256 fijado y aplica umbrales calibrados (0,5 por defecto, 0,58 a nivel de bloque). Los resultados publicados en su model card son altos, aunque el propio autor advierte que las cifras son optimistas para familias de ataque no vistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens en entrenamiento; entrada operativa de hasta 40 lineas OCR consecutivas |
| Tipos de cuantizacion | float16 (almacenamiento) y float32 (carga en pipeline); no se documentan otras |
| Idiomas soportados | no disponible (el entrenamiento incluye ataques no ingleses, pero no se enumeran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Horizon-Labs/prompt-injection-guard-base` (revision `2c20b6e2`), un encoder ModernBERT, y se somete a un ajuste fino completo con entropía cruzada y optimizador AdamW. La versión v3 se entrenó con lr 2e-5, 10 % de warmup, batch 16, máximo 1.024 tokens y 2 épocas, conservando el mejor checkpoint por AUC de validación. La versión v3.3 continúa desde v3 durante 1 época adicional con lr 1e-5 sobre 36.190 ejemplos de entrenamiento y 4.059 de validación.

El corpus combina facturas y recibos OCR públicos (splits de train), facturas cripto sintéticas, hojas de nómina y páginas web, 6.404 filas reales de Tesseract y datos generales de inyección de prompt (deepset, xTRam1, LLMail, PromptShield, splits de train). Además incorpora familias de ataque nuevas: cambios de dirección de wallet con estilo de etiqueta, preguntas y tareas plantadas en documentos (prompts de Dolly y escritos a mano), secuestros de formato de salida, ataques en otros idiomas y ataques de role-play. El preprocesado elimina caracteres invisibles de formato y sustituye direcciones de wallet, incluidas las degradadas por OCR, por el token `[wallet]` (`mask_mode: ocr`). El autor verificó que el almacenamiento en float16 no altera ninguna decisión frente a float32 sobre 4.061 documentos, con un cambio máximo de puntuación de 0,009.

## Capacidades

- Clasificación binaria de texto con etiquetas `SAFE` e `INJECTION`, devolviendo P(injection) como salida.
- Detección de inyecciones de prompt en texto procedente de OCR de facturas, recibos y documentos de pago.
- Detección de familias de ataque específicas: cambios de dirección de wallet (incluidas variantes ofuscadas), preguntas y tareas incrustadas, secuestro de formato de salida, role-play y ataques en idiomas distintos del inglés.
- Normalización de direcciones de wallet, incluidas las mal reconocidas por OCR, antes de la clasificación.
- Funcionamiento a nivel de línea (hasta 40 líneas consecutivas) y agregación a nivel de página mediante la puntuación combinada del pipeline.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto ni capacidades multimodales: es exclusivamente un clasificador.

## Casos de uso

- Filtrado previo en pipelines de agentes que leen documentos: el clasificador se ejecuta sobre las líneas OCR antes de que el LLM las consuma, bloqueando documentos con instrucciones incrustadas y reduciendo el riesgo de secuestro del agente.
- Procesamiento de facturas y recibos en sistemas de cuentas por pagar: se aplica sobre el texto extraído para evitar que un proveedor malicioso introduzca instrucciones que alteren la dirección de pago o el importe.
- Protección de pagos con criptomonedas: el enmascarado de wallets y la detección de cambios de dirección con estilo de etiqueta están diseñados para impedir que el atacante sustituya la dirección de destino del lector automático.
- Moderación de contenido en plataformas que aceptan documentos subidos por usuarios: el modelo marca páginas con texto hostil antes de que entren en colas de revisión o en sistemas de resumen automático.
- Auditoría de seguridad de pipelines existentes: se puede ejecutar en modo offline sobre corpus históricos de documentos para medir la tasa de ataques que habrían pasado el filtro.
- Integración en CI/CD de sistemas RAG documentales: como paso de validación que bloquea la indexación de documentos que contienen inyecciones, evitando que contaminen el almacén vectorial.
- Evaluación comparativa de defensas: sirve como línea base de detección para comparar con otros clasificadores de inyección sobre el mismo conjunto de documentos OCR.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a un conjunto de evaluación construido por separado, nunca usado en entrenamiento, evaluado a través del escaneo y la puntuación combinada del pipeline con la regla desactivada:

| Metrica | Resultado |
|---|---|
| AUC de validacion (v3.3) | 0,9999 |
| Documentos atacados bloqueados | 99,5 % de 1.346 |
| Ataques que pasan sin aviso | 0,4 % |
| Direccion del atacante que llega al lector | 0,0 % |
| Documentos limpios bloqueados | 6,7 % de 1.972 |
| Deteccion a nivel de pagina | 99,6 % de 1.416 ataques |
| Paginas limpias marcadas | 6,8 % de 2.182 |
| Conjunto fresco: ataques detectados | 99,2 % de 131 |
| Conjunto fresco: lineas legitimas marcadas | 2 % de 40 |
| Conjunto fresco: bloques de pago limpios marcados | 0 % de 60 |

No se han publicado resultados en benchmarks estándar de la literatura (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es coherente con la naturaleza de clasificador especializado del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en float16 y 1,2 GB en float32, más el overhead del runtime. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090 o T4 es más que suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el pipeline del autor lo instala con `uv run python -m pipeline.injection.download`; al ser un modelo de la familia ModernBERT con safetensors, es desplegable con Transformers, así como con servidores de inferencia compatibles con text-classification (TGI, vLLM). No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| injection_classifier_eth (este) | 307,5 M | 1.024 tokens / 40 lineas OCR | Clasificacion SAFE/INJECTION en documentos OCR | Apache 2.0 | Hugging Face |
| Horizon-Labs/prompt-injection-guard-base | no disponible | no disponible | Clasificacion de inyeccion de prompt (modelo base) | no disponible | Hugging Face |
| Clasificadores genericos de inyeccion (deepset, PromptShield) | no disponible | no disponible | Deteccion de inyeccion en texto general | no disponible | Usados como datos de entrenamiento |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Las cifras de evaluación son optimistas: las familias de ataque nuevas se diseñaron tras estudiar los fallos de v3 en el conjunto de evaluación, y el conjunto fresco cubre las mismas familias con redacción distinta, por lo que no reflejan estilos de ataque aún no escritos.
- Las líneas de pago legítimas en escaneos reales de Tesseract se marcan con más frecuencia que en v3 (16 de 100), lo que implica falsos positivos en documentos reales.
- Las líneas que el OCR no puede verificar nunca se puntúan, dejando un hueco de cobertura en documentos de baja calidad.
- Las probabilidades no están calibradas; el umbral de 0,5 y el nivel de bloque de 0,58 son decisiones del pipeline, no valores probabilísticos interpretables.
- El modelo está diseñado para ejecutarse dentro de un pipeline concreto y no para carga directa; su uso fuera de ese contexto requiere replicar el preprocesado (eliminación de caracteres invisibles, enmascarado de wallets) y los umbrales.
- El contexto de entrada es corto (40 líneas OCR, 1.024 tokens), por lo que documentos largos deben fragmentarse y agregarse, con el riesgo de perder instrucciones repartidas entre fragmentos.
- No se documentan los sesgos del modelo ni los idiomas cubiertos, lo que limita la evaluación de su comportamiento en dominios lingüísticos distintos del inglés.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `Horizon-Labs/prompt-injection-guard-base` tiene licencia no disponible en la información, lo que conviene verificar antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/icefireman/injection_classifier_eth
- Modelo base: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Paper de ModernBERT: no disponible en la información proporcionada
- Repositorio del pipeline: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
