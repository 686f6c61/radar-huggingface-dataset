# genos-security/genos

## Resumen

Genos es un sistema de triaje de amenazas en linea de comandos desarrollado por genos-security. Clasifica una unica linea de comando (shell o script en Linux, macOS, Windows y PowerShell) en dos niveles: un gatekeeper de tres clases (Benign, Malicious, Context_Dependent) y, para los comandos no benignos, un especialista en once familias de tacticas mas un codificador de comportamiento. El repositorio aloja los artefactos de ejecucion del servicio `genos_api`.

El nivel 1 emplea un encoder compartido CodeBERT (`microsoft/codebert-base`) con cabezas de decision descompuestas; el nivel 2 por defecto usa caracteristicas TF-IDF de caracteres y palabras alimentando un SVM lineal por familia, con calibracion sigmoide; y existe ademas un behavior encoder tambien basado en CodeBERT. El backbone CodeBERT no se incluye en el repositorio y debe descargarse aparte. La longitud maxima de entrada en los componentes transformer es de 256 tokens.

Es relevante porque plantea el triaje automatizado de comandos sospechosos con una arquitectura en cascada que evita el coste del nivel 2 para los comandos benignos. El autor advierte de forma explicita que las metricas de validacion pueden ser optimistas y que cada salida es una estimacion del modelo, no un veredicto que deba ejecutarse automaticamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nivel 1 y behavior encoder: encoder CodeBERT (transformer) con cabezas de clasificacion; nivel 2 por defecto: TF-IDF (char_wb 2-5-gramas y word 1-2-gramas) + SVM lineal calibrado |
| Parametros totales | no disponible (backbone: microsoft/codebert-base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (max length en los componentes transformer) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch checkpoint (`.pt`) y joblib de scikit-learn (`.joblib`); el backbone CodeBERT no esta incluido |

Artefactos del repositorio:

| Fichero | Formato | Tamano | Funcion |
|---|---|---:|---|
| `gatekeeper.pt` | PyTorch checkpoint | 502 MB | Gatekeeper de tres clases (nivel 1) |
| `family_specialist_tfidf.joblib` | joblib (scikit-learn) | 33 MB | Especialista multi-etiqueta de 11 familias (nivel 2 por defecto) |
| `family_specialist_tfidf.json` | JSON | 45 KB | Configuracion, auditoria de particiones, metricas y hash del checkpoint |
| `behavior_encoder.pt` | PyTorch checkpoint | 499 MB | Codificador de etapa de ataque y etiquetas de accion |
| `behavior_encoder.json` | JSON | 1 KB | Mapas de etiquetas de comportamiento y metricas de test |

## Arquitectura y entrenamiento

El sistema es una cascada. Una linea de comando pasa primero por una etapa de decodificacion (Base64 y ofuscacion) y despues por el gatekeeper de nivel 1, que reparte la salida en `Benign`, `Malicious` o `Context_Dependent`. Los comandos benignos se saltan el nivel 2 por defecto. El gatekeeper usa un encoder CodeBERT compartido con cabezas descompuestas: `verdict_logits`, `non_benign_logit`, `malicious_given_non_benign_logit` y `ordinal_risk_logit`. Se entreno durante 5 epocas (mejor epoca 5), con max length 256, learning rate 1e-5, weight decay 0.01, label smoothing 0.05, tamano de lote efectivo 256, muestreo balanceado, semilla 42 y un parche operativo de 250 filas benignas.

El especialista de familias del nivel 2 usa TF-IDF con 250 000 caracteristicas de caracteres (`char_wb` 2-5-gramas) y 100 000 de palabras (1-2-gramas con patron de tokenizacion consciente de shell), que alimentan un SVM lineal por familia con calibracion sigmoide ajustada solo sobre entrenamiento. Su conjunto de datos es de 37 846 comandos de entrenamiento, 4 740 de validacion y 4 740 de test, dividido 80/10/10 por grupo de plantilla residual del parser (semilla 42), sin solapamiento de comandos entre particiones. El behavior encoder es un encoder CodeBERT con un clasificador de etapa y una cabeza multi-etiqueta de acciones, tambien con max length 256. No se documentan etapas de RLHF ni DPO.

## Capacidades

- Clasificacion de lineas de comando individuales en tres clases: `Benign`, `Malicious` y `Context_Dependent`.
- Marcado de comandos que requieren contexto ambiental para juzgarse, mediante la clase `Context_Dependent`.
- Clasificacion multi-etiqueta sobre 11 familias de tacticas: Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Command-and-Control / Payload Retrieval, Exfiltration, Impact y Benign Admin.
- Codificacion de comportamiento: clasificacion de etapa de ataque sobre 13 categorias.
- Etiquetado multi-etiqueta de acciones sobre 9 categorias: `archive_data`, `download_remote_resource`, `execute_inline_code`, `execute_interpreter`, `extract_archive`, `remote_execution`, `use_encoded_payload`, `use_obfuscation` y `use_signed_proxy_binary`.
- Decodificacion previa de Base64 y ofuscacion en la entrada.
- No predice identificadores de tecnicas MITRE concretos.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Triaje previo en un SIEM: prefiltrar lineas de comando capturadas en telemetria de endpoints para separar lo benigno de lo que merece revision humana, usando el gatekeeper de nivel 1 y dejando el nivel 2 para los comandos no benignos.
- Analisis de PowerShell en respuesta a incidentes: clasificar comandos ofuscados o codificados en Base64 y etiquetar acciones como `use_encoded_payload` o `download_remote_resource` para orientar la investigacion.
- Enriquecimiento de alertas EDR: adjuntar a cada alerta la familia de tactica estimada (por ejemplo Defense Evasion o Credential Access) y la etapa de ataque, de modo que el analista priorice por severidad.
- Automatizacion de politicas de bloqueo con revision humana: usar la salida `Malicious` como disparador de cuarentena o aislamiento, siempre con confirmacion, dado que el autor indica que la salida es una estimacion.
- Monitorizacion de scripts en CI/CD: inspeccionar comandos de build o despliegue para detectar patrones de exfiltracion o descarga remota de recursos antes de su ejecucion.
- Clasificacion por lotes de corpus historicos: procesar grandes volumenes de comandos en CPU con el especialista TF-IDF (unos 2,9 ms de mediana por comando) para construir estadisticas de tacticas sin depender de GPU.
- Formacion y evaluacion en seguridad: usar las particiones y metricas publicadas como base para reproducir o comparar clasificadores de comandos en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si reporta metricas propias por componente.

Gatekeeper, nivel 1 (metricas declaradas por el autor):

| Particion | Accuracy | Macro F1 |
|---|---:|---:|
| Validacion | 0.963 | 0.955 |
| Test | 0.948 | 0.932 |

Test por clase (nivel 1): Benign P 0.968 / R 0.957 / F1 0.962; Malicious P 0.944 / R 0.970 / F1 0.957; Context_Dependent P 0.880 / R 0.871 / F1 0.876. El autor advierte que estas cifras provienen de la particion original y que una auditoria posterior encontro filas conflictivas y expuestas en desarrollo en particiones anteriores, por lo que deben tratarse como optimistas.

Especialista de familias, nivel 2 (test, umbral 0.5):

| Familia | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| Execution | 0.62 | 0.48 | 0.54 | 92 |
| Persistence | 0.77 | 0.62 | 0.68 | 144 |
| Privilege Escalation | 0.73 | 0.50 | 0.59 | 147 |
| Defense Evasion | 0.77 | 0.56 | 0.65 | 280 |
| Credential Access | 0.82 | 0.53 | 0.64 | 59 |
| Discovery | 0.74 | 0.58 | 0.65 | 115 |
| Lateral Movement | 1.00 | 0.14 | 0.25 | 7 |
| Command-and-Control / Payload Retrieval | 0.81 | 0.54 | 0.65 | 39 |
| Exfiltration | 1.00 | 0.11 | 0.20 | 9 |
| Impact | 0.50 | 0.38 | 0.43 | 21 |
| Benign Admin | 0.98 | 0.99 | 0.99 | 4 027 |

Macro F1 de 0.570 en test (0.604 en validacion). La prediccion top-1 coincide con al menos una familia real el 93,7 % de las veces (top-2: 96,0 %). El autor senala que las familias mas debiles (Lateral Movement, Exfiltration, Impact) tienen muy pocos ejemplos y sus puntuaciones son ruidosas, y que la precision supera al recall.

Behavior encoder (test, metricas declaradas por el autor): accuracy de etapa 0.565, macro F1 de etapa 0.500 y micro F1 de acciones 0.936. El autor advierte que las etiquetas de accion derivan del mismo parser y reglas que la entrada, por lo que ese F1 alto refleja reproduccion de reglas y no comprension conductual independiente.

## Requisitos de hardware

- El especialista de familias (`family_specialist_tfidf.joblib`, 33 MB) funciona en CPU: unos 2,9 ms de mediana y 3,1 ms p95 por comando, excluyendo HTTP y el resto de modelos.
- Los checkpoints `gatekeeper.pt` (502 MB) y `behavior_encoder.pt` (499 MB) corresponden a un backbone CodeBERT; el backbone no esta incluido y debe descargarse aparte.
- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un backbone CodeBERT con max length 256, el consumo es bajo y compatible con GPU de consumo, aunque no se aportan cifras concretas.
- GPU recomendadas: no disponible.
- Opciones de despliegue: el autor describe un servicio `genos_api` que carga los ficheros desde un directorio `models/`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo esas herramientas no aplican de forma directa.
- Latencia y throughput: solo se aporta la latencia del especialista TF-IDF en CPU; no hay datos para los componentes transformer.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables publicados en la informacion proporcionada para enfrentar Genos a alternativas concretas de la misma categoria (clasificadores de comandos o de malware basados en transformer). No es posible completar una tabla con parametros, contexto, rendimiento y licencia de terceros sin inventar datos, por lo que se indica: no disponible.

A modo cualitativo, dentro del propio sistema pueden compararse sus dos enfoques internos:

| Componente | Enfoque | Coste | Uso previsto |
|---|---|---|---|
| Gatekeeper (nivel 1) | CodeBERT con cabezas descompuestas | Alto (checkpoint 502 MB, transformer) | Filtro inicial de tres clases |
| Especialista TF-IDF (nivel 2) | TF-IDF + SVM lineal calibrado | Bajo (33 MB, CPU, ~2,9 ms) | Multi-etiqueta de 11 familias |
| Behavior encoder | CodeBERT con cabeza de etapa y acciones | Alto (checkpoint 499 MB) | Etapa de ataque y etiquetas de accion |

## Limitaciones y advertencias

- Las metricas del gatekeeper proceden de la particion original y una auditoria posterior encontro filas conflictivas y expuestas en desarrollo en particiones anteriores; deben considerarse optimistas y no como precision de produccion.
- El autor indica que cada salida es una estimacion del modelo, no un veredicto que deba ejecutarse automaticamente.
- Las familias Lateral Movement, Exfiltration e Impact tienen muy pocos ejemplos de test (7, 9 y 21), por lo que sus puntuaciones son ruidosas.
- La precision es generalmente superior al recall: el modelo tiende a no detectar familias de ataque antes que a inventarlas, y su error mas frecuente es predecir `Benign Admin` para comandos de Defense Evasion o Discovery.
- El micro F1 de acciones (0.936) refleja la reproduccion de las mismas reglas y parser usados en la entrada, no una comprension conductual independiente.
- No predice identificadores de tecnicas MITRE; la etiqueta `mitre-attack` del repositorio no implica prediccion de tecnicas concretas.
- Idiomas: unicamente ingles.
- Longitud limitada a 256 tokens en los componentes transformer, lo que puede truncar lineas de comando muy largas.
- El backbone `microsoft/codebert-base` no se incluye y debe descargarse por separado.
- Licencia Apache 2.0, que permite uso comercial, pero no se documentan garantias ni condiciones adicionales del autor mas alla de las advertencias de fiabilidad.
- El repositorio registra 0 descargas y 0 likes, sin evidencia publica de adopcion o validacion externa.
- No se documentan sesgos especificos, mas alla del desequilibrio entre familias con poco soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/genos-security/genos
- Modelo base: https://huggingface.co/microsoft/codebert-base
