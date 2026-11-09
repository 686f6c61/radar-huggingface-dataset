# APLUX-Agora/PPE-Detection

## Resumen

PPE-Detection es un modelo de deteccion de objetos publicado por APLUX-Agora dentro de su catalogo Agora, orientado a la deteccion de equipos de proteccion individual (PPE, por sus siglas en ingles) en entornos industriales y de obra. El repositorio no contiene pesos en formato convencional de entrenamiento, sino artefactos de despliegue ya convertidos y validados por placa para aceleradores Qualcomm, empaquetados por SoC objetivo y con distintas precisiones de cuantizacion. La model card esta redactada mayoritariamente en chino e ingles y describe el flujo de descarga y despliegue mediante la herramienta `hf download` y la plataforma Agora.

La propuesta de valor del modelo no es la innovacion algorítmica, sino la ingenieria de despliegue en el borde (edge): recursos listos para ejecutarse sobre QCS6490 (placa Rhino Pi A1) y QCS8550 (placa Rhino Pi X1) con latencias medidas de 3,6 ms y 1,0 ms respectivamente en la precision por defecto. Esto lo hace relevante para pipelines de vision artificial en AIoT donde el coste por inferencia y la predictibilidad en placa son criticos, aunque carece de informacion publica sobre arquitectura, datos de entrenamiento o metricas de calidad de deteccion.

El repositorio tiene un tamano de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y la licencia de los recursos convertidos es la APLUX Model Farm License, distinta de la licencia del modelo fuente original, que la propia model card remite a "los terminos del modelo original" sin especificarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de vision, no generativo de texto) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (segun placa) |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License para los recursos convertidos; licencia del modelo fuente no especificada |
| Formato de pesos | artefactos de despliegue por SoC: `model.json` + directorios por precision con binarios `model.bin` (formato QNN de Qualcomm) |
| Tarea | object-detection |
| Entrada | imagen |
| Salida | cajas (boxes) |
| SoC soportados | QCS6490, QCS8550 |
| Precisiones por placa | QCS6490: W8A16, W8A8; QCS8550: FP16, W8A16, W8A8 |
| Latencia medida (precision por defecto) | 3,6 ms en QCS6490 (Rhino Pi A1); 1,0 ms en QCS8550 (Rhino Pi X1) |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base en la documentacion disponible. La model card solo identifica la tarea (deteccion de objetos con entrada de imagen y salida de cajas) y describe el proceso de conversion y validacion por placa mediante Model Farm, la herramienta oficial de preprocesado y generacion de artefactos de APLUX-Agora. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion como RLHF o DPO, ni el origen exacto del modelo fuente.

La innovacion tecnica documentada es de naturaleza de despliegue: los recursos se organizan en `targets/<SoC>/` con un `model.json` que declara la precision por defecto y las rutas de cada variante, y binarios de contexto QNN nombrados `model.bin`. Se incluyen ficheros `NOTICE.md` y `SHA256SUMS` para trazabilidad e integridad, y el paquete conserva la estructura multi-fichero tal como la publica Model Farm. El preprocesado, el postprocesado y el runner se obtienen desde la plataforma Agora (seccion "despliegue" o exportando un workflow que use el modelo).

## Capacidades

- Deteccion de objetos sobre imagenes, con salida de cajas delimitadoras.
- Deteccion especifica de equipos de proteccion individual (PPE) en entornos industriales, segun el nombre y la orientacion del modelo.
- Inferencia en el borde sobre aceleradores Qualcomm QCS6490 y QCS8550 con latencias de milisegundos.
- Ejecucion en varias precisiones (FP16, W8A16, W8A8) para ajustar el compromiso entre latencia, memoria y exactitud.
- Integracion con la plataforma Agora para prueba online sin hardware fisico y exportacion de proyectos de despliegue.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision generativa, tool calling, agentes, multilingueismo ni modos de pensamiento.

## Casos de uso

- Monitorizacion de cumplimiento de EPI en obra: el modelo se ejecuta sobre la camara de una placa QCS6490 o QCS8550 y genera cajas de deteccion que un modulo de logica aguas abajo convierte en alertas cuando un trabajador aparece sin casco, chaleco o gafas.
- Control de acceso a zonas de riesgo: en una puerta de area restringida, la inferencia a 1,0 ms en QCS8550 permite validar en tiempo real que la persona que entra lleva el EPI exigido antes de desbloquear el torno.
- Analitica de seguridad en lineas de produccion: integrado en un sistema de vision multi-camara, el modelo procesa fotogramas de varias estaciones y alimenta dashboards de cumplimiento por turno y por planta.
- Inspeccion en drones o robots moviles: el bajo coste computacional y el soporte de cuantizacion W8A8 permiten embarcar el detector en plataformas con presupuesto energetico limitado.
- Prototipado rapido sin hardware: mediante la demo online de Agora (mega.aidlux.com/models/ppe-detection) se puede evaluar el comportamiento del detector antes de adquirir la placa objetivo.
- Despliegue reproducible en flota de dispositivos: los artefactos por SoC con `model.json`, `NOTICE.md` y `SHA256SUMS` facilitan la distribucion versionada y la verificacion de integridad en flotas de dispositivos Qualcomm.
- Pre-filtrado en pipelines de videovigilancia: usar el detector como primera etapa barata que descarta fotogramas sin personas y reduce la carga de modelos mas costosos aguas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de deteccion (mAP, precision/recall por clase, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son latencias medidas en placa:

| SoC · placa | Precisiones | Latencia medida (precision por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 3,6 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 1,0 ms |

## Requisitos de hardware

- Hardware objetivo: aceleradores Qualcomm QCS6490 (placa Rhino Pi A1) y QCS8550 (placa Rhino Pi X1); no se documenta soporte para GPU de escritorio ni para CPU generica.
- VRAM estimada: no disponible; el modelo esta empaquetado para NPU/SoC Qualcomm, no para GPU discreta.
- GPU recomendadas: no aplica; el formato de pesos es QNN para aceleradores Qualcomm.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: descarga de artefactos por SoC con `hf download` y ejecucion mediante el runner y el proyecto exportado desde la plataforma Agora; el preprocesado y postprocesado se obtienen desde Agora.
- Latencia: 3,6 ms en QCS6490 y 1,0 ms en QCS8550 en la precision por defecto.
- Throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de deteccion de PPE en el borde ni datos de calidad (mAP) que permitan una comparacion rigurosa con alternativas como YOLO u otros detectores desplegados en Qualcomm.

## Limitaciones y advertencias

- No se publica informacion sobre la arquitectura, el dataset de entrenamiento ni las metricas de calidad del detector, lo que impide evaluar su exactitud antes de desplegarlo.
- El modelo esta empaquetado exclusivamente para QCS6490 y QCS8550; no hay artefactos para otras plataformas ni para GPU/CPU convencionales.
- La licencia de los recursos convertidos es la APLUX Model Farm License, con terminos recogidos en `LICENSE_MODEL_FARM.pdf`; la licencia del modelo fuente original no se especifica y debe consultarse antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso ni validacion independiente por parte de la comunidad.
- No se documentan sesgos conocidos ni riesgos de alucinacion, pero al ser un detector de vision, su rendimiento dependera de la iluminacion, el angulo de camara y la similitud de los EPI con los del conjunto de entrenamiento.
- No se especifican idiomas soportados ni capacidades multilingues; la model card esta en chino e ingles.
- La fecha de creacion del repositorio (2026-11-09) es posterior a la fecha actual en el momento de la consulta; conviene verificar la vigencia y autoria del artefacto antes de integrarlo en produccion.
- El tamano del repositorio es de 0,0 GB, lo que puede indicar que los artefactos no estan efectivamente alojados o que la medicion no los refleja; verificar la descarga real antes de planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/PPE-Detection
- Demo online en Agora: https://mega.aidlux.com/models/ppe-detection
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/PPE-Detection/blob/main/LICENSE_MODEL_FARM.pdf
