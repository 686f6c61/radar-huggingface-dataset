# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-dpo

## Resumen

LFM3-VL-2B-MobileAgent-v4.3-dpo es un modelo vision-lenguaje de 1.918 millones de parametros (1,92 B) especializado en actuar como agente de interfaz grafica sobre Android: recibe una captura de pantalla y un objetivo en lenguaje natural y emite la siguiente accion como JSON. Lo desarrolla el usuario experimentalmachines partiendo del modelo base LiquidAI/LFM3-VL-2B y de su propio checkpoint v4.2, mediante un ajuste fino con LoRA y una etapa de DPO a nivel de paso. El pipeline declarado es image-text-to-text y la libreria transformers con safetensors.

La relevancia de esta ficha es doble. Por un lado documenta una tecnica concreta de alineamiento para agentes GUI: DPO sobre pares construidos con las propias predicciones erroneas del modelo frente al paso humano correcto en la misma pantalla. Por otro, y de forma explicita, es un resultado negativo publicado de forma deliberada: el modelo no supero su puerta de validacion offline y su precision de paso en AndroidControl cayo de 0,732 a 0,545, con colapso de tipos de accion completos.

Por tanto, no debe considerarse un modelo listo para produccion. El autor recomienda usar v4 (modelo principal) o v4.2, y mantiene este checkpoint publico como documentacion del fallo y de su causa. La licencia es LFM Open License v1.0, heredada del modelo base de LiquidAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (lfm3_vl) con torre de vision congelada y proyector congelado; adaptador LoRA de lenguaje fusionado en los pesos |
| Parametros totales | 1.918.181.888 (1,92 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; la entrada incluye los ultimos 8 pasos como historial de texto |
| Tipos de cuantizacion | no disponible; no se publico GGUF |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors (transformers), con adaptador LoRA en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de los pesos fusionados de v4.2 y aplica una etapa de DPO a nivel de paso con beta 0,1, combinada con un 0,5 x SFT sobre el paso preferido. Sobre esa base se entrena un nuevo LoRA solo de lenguaje con r=64 y alpha=128, que se fusiona en los pesos; la torre de vision y el proyector permanecen congelados. La entrada visual es una captura de pantalla redimensionada a un maximo de 880 x 880 px de area, lo que equivale a unos 720 tokens de imagen. La decodificacion recomendada es con modo de razonamiento activado y temperatura 0.

Los datos de preferencia se generaron sin entorno, sin modelo profesor y sin datos de benchmark: v4.2 decodifico de forma greedy sus propias filas de entrenamiento y, en los casos en que su accion era incorrecta segun el scorer de AndroidControl, se construyo el par (paso humano preferido frente a paso propio rechazado) sobre la misma pantalla. Se excluyeron las filas cuyo paso humano era `wait`. El conjunto resulto en 4.163 pares, de los cuales 3.039 eran clics o escrituras genericas erroneas, y `wait` solo aparecia nunca como lado preferido. Esa composicion explica el fallo: el DPO penalizo esos tipos de accion de forma global, no solo en los contextos donde el modelo se equivocaba.

## Capacidades

- Generacion de la siguiente accion en formato JSON compacto, precedida de un bloque `<think>` con la intencion en una frase corta.
- Acciones soportadas: clic, pulsacion larga, entrada de texto, desplazamiento (arriba, abajo, izquierda, derecha), abrir aplicacion, navegar atras, ir a inicio, enter de teclado, esperar, responder una pregunta y marcar estado de objetivo (completo o inviable).
- Coordenadas normalizadas a una rejilla entera de 0 a 1000 sobre la captura de pantalla.
- Comprension de capturas de pantalla de Android y de la lista de aplicaciones instaladas proporcionada en el prompt.
- Seguimiento de historial de hasta 8 pasos previos en formato texto (`n. <intencion> -> <JSON de accion>`).
- Respuesta a objetivos que formulan una pregunta mediante la accion `answer`, con formato corto.
- Capacidad multilingue limitada al ingles.
- No soporta audio ni tool calling generico fuera de las acciones del espacio de acciones Android descrito.

## Casos de uso

- Investigacion sobre alineamiento de agentes GUI: el checkpoint sirve como caso documentado de como un DPO con pares mal balanceados degrada tipos de accion completos; util para disenar conjuntos de preferencia mas equilibrados antes de repetir el experimento.
- Reproduccion de resultados negativos: permite replicar la comparacion v4.2 frente a v4.3-dpo sobre AndroidControl con el mismo harness del repositorio del proyecto y verificar la caida de precision de 0,732 a 0,545.
- Analisis de colapso de acciones: util para estudiar por que `open_app` cae de 0,95 a 0,16, `wait` de 0,59 a 0,00 y `scroll` de 0,62 a 0,16 cuando el lado rechazado concentra ejemplos genericos.
- Prototipado offline de pipelines de agente movil: con temperatura 0 y una captura por paso, sirve para probar el formato de entrada y salida (objetivo, apps instaladas, historial, accion JSON) sin desplegar en un telefono real.
- Evaluacion de estrategias de congelacion de vision: dado que la torre visual y el proyector estan congelados, permite medir cuanto del comportamiento del agente depende solo del adaptador de lenguaje.
- Docencia y divulgacion: ejemplo didactico de construccion de pares de preferencia a partir de las propias predicciones del modelo y de las consecuencias de no equilibrar el conjunto.
- No recomendado para atencion al cliente, automatizacion de cuentas reales, pagos ni mensajeria: el propio autor lo prohibe como uso no supervisado.

## Benchmarks y rendimiento

| Metrica (AndroidControl) | v4.2 | v4.3-dpo | Umbral |
|---|---|---|---|
| Precision de paso de alto nivel | 0,732 | 0,545 | >= 0,712 (falla) |
| Precision de `complete` terminal | 0,738 | 0,885 | >= 0,70 |
| dev_answer | 0,868 | 0,875 | >= 0,848 |

Desglose por tipo de accion en la caida de precision de paso: `open_app` 0,95 a 0,16; `wait` 0,59 a 0,00; `scroll` 0,62 a 0,16. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de evaluacion online en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 1,92 B de parametros, en precision completa (fp16) los pesos ocupan unos 3,8 GB; el repo completo pesa 4,1 GB, coherente con ese orden de magnitud. A ello hay que sumar el coste de la torre de vision y de los aproximadamente 720 tokens de imagen por paso.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada por el autor; no se publico GGUF y el modelo no se ha ejecutado en un telefono.
- Opciones de despliegue: transformers (libreria declarada, con `custom_code` y compatibilidad con endpoints). No hay artefactos para llama.cpp, Ollama, vLLM ni TGI publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision de paso AndroidControl | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.3-dpo | 1,92 B | no disponible (historial de 8 pasos) | 0,545 (falla la puerta) | LFM Open License v1.0 | Resultado negativo publicado |
| LFM3-VL-2B-MobileAgent-v4.2 | 1,92 B | no disponible (historial de 8 pasos) | 0,732 | LFM Open License v1.0 | Checkpoint previo, recomendado por el autor |
| LFM3-VL-2B-MobileAgent-v4 | no disponible | no disponible | no disponible en esta ficha | LFM Open License v1.0 | Modelo principal recomendado por el autor |
| LFM3-VL-2B (LiquidAI) | 2 B (familia) | no disponible | no aplica (modelo base generalista) | LFM Open License v1.0 | Modelo base del que deriva la familia |

## Limitaciones y advertencias

- Modelo de investigacion: el autor prohibe explicitamente dejarlo actuar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- No supero la puerta offline: precision de paso 0,545 frente al umbral de 0,712. No ha sido evaluado online y puede ser peor que v4.2 en uso real.
- Colapso de tipos de accion: `open_app`, `wait` y `scroll` se degradan severamente porque el conjunto de preferencia estaba dominado por clics y escrituras erroneas y `wait` solo aparecia como lado rechazado.
- Solo objetivos en ingles; sin soporte multilingue.
- Una unica captura por paso y sin memoria mas alla del historial de texto de 8 pasos.
- Riesgo de alucinacion en la eleccion de aplicacion instalada y en las coordenadas normalizadas, con posibles pulsaciones fuera del elemento objetivo.
- Sin formato GGUF ni validacion en dispositivo movil; el gate offline de cuantizacion fallo.
- Licencia LFM Open License v1.0 heredada de LiquidAI/LFM3-VL-2B: revisar condiciones de uso comercial en el archivo LICENSE antes de cualquier despliegue.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-dpo
- Modelo base (checkpoint previo): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2
- Correccion del fallo: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-dpo2
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
