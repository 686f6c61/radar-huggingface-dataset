# mosetireagan/deplyze-mini

## Resumen

Deplyze-Mini es un modelo de lenguaje causal de tipo decoder-only, desarrollado por el equipo Deplyze Core ML, especializado en razonamiento sobre dependencias de software y seguridad de la cadena de suministro. No es un chatbot de proposito general: parte de Qwen2.5-0.5B-Instruct y se afina mediante LoRA (PEFT) para interpretar hallazgos estructurados producidos por escaneres deterministas (Deplyze, OSV, lockfiles, registros de paquetes) y emitir veredictos de puerta (`ALLOW`, `WARN`, `BLOCK`, `REVIEW`) con puntuaciones de confianza basadas en la completitud de la evidencia.

El problema que aborda es concreto: los asistentes genericos alucinan identificadores de vulnerabilidad (CVE/GHSA) o confunden la ausencia de evidencia con seguridad. Deplyze-Mini se entrena bajo axiomas de seguridad defensiva explicitos («desconocido no es seguro», «antiguo no es vulnerable», «popular no es seguro») y trata los metadatos de paquetes no confiables como frontera aislada frente a inyeccion de prompts.

Con aproximadamente 0,49 mil millones de parametros de base mas unos 4,2 millones de parametros del adaptador LoRA, una ventana de contexto de 2048 a 4096 tokens y licencia Apache 2.0, es un modelo muy ligero, pensado para integrarse en pipelines de CI/CD y agentes de auditoria mas que para uso conversacional. Su relevancia ahora radica en que la seguridad de la cadena de suministro de software exige decisiones deterministas y auditables que un modelo generalista no puede garantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) con ajuste fino parametro-eficiente (LoRA/PEFT) sobre proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) |
| Parametros totales | ~0,49 mil millones (modelo base) + ~4,2 millones (adaptador LoRA) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 a 4096 tokens |
| Tipos de cuantizacion | bfloat16, int8, int4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (base y adaptador) |
| Formato de pesos | safetensors (adaptador LoRA compatible con transformers/PEFT) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only heredado de Qwen2.5-0.5B-Instruct, sobre el que se aplica un adaptador LoRA de rango r = 16, alpha = 32 y dropout 0,05 en las cuatro proyecciones de atencion. La perdida es entropia cruzada de LM causal con enmascaramiento de los tokens de instruccion, optimizada con AdamW y un schedule de learning rate coseno con pico de 2,0 x 10^-4. La model card indica que la configuracion es extensible a variantes de 1,5B y 3B sobre la misma receta.

Los datos de entrenamiento combinan fuentes deterministas y generadas: la base de datos OSV (avisos normalizados de npm, PyPI, Go, Maven, Cargo y NuGet, CC-BY 4.0), la GitHub Advisory Database (metricas CVSS normalizadas, versiones afectadas y rangos parcheados, CC-BY 4.0), la lista de licencias SPDX (CC0-1.0) y un generador de escenarios determinista que produce arboles de dependencias multinivel, permutaciones de versiones, candidatos de typosquatting e inyecciones de prompt adversarias. Se declara cero fuga de datos entre entrenamiento y evaluacion mediante hashing de huellas (0,0% de solapamiento).

La innovacion principal no es arquitectonica sino de diseno de comportamiento: el modelo opera bajo axiomas de seguridad defensiva y una frontera explicita de metadatos no confiables, de modo que descripciones de paquetes, READMEs y textos de scripts quedan aislados para defenderse de la inyeccion de prompts. El ajuste se centra en producir salidas fuertemente tipadas y fundamentadas en hechos de escaneo, en lugar de conocimiento parametrico de vulnerabilidades.

## Capacidades

- Decisiones de puerta en CI/CD y agentes: emite veredictos tipados `ALLOW`, `WARN`, `BLOCK` y `REVIEW` con puntuacion de confianza derivada de la completitud de la evidencia.
- Explicacion y triaje de vulnerabilidades: traduce avisos CVE/GHSA a explicaciones accionables para desarrolladores sin fabricar contexto ausente.
- Razonamiento de actualizacion y compatibilidad SemVer: evalua riesgo de cambios disruptivos entre saltos de version y recomienda versiones objetivo parcheadas.
- Auditoria de cadena de suministro y scripts: detecta anomalias en scripts de ciclo de vida (`postinstall`), paquetes de edad reciente y senales de typosquatting.
- Cumplimiento de licencias: verifica licencias de paquetes frente a politicas de cumplimiento del proyecto y restricciones de copyleft reciproco.
- Razonamiento multi-paso sobre arboles de dependencias: el caso de uso de triaje implica cadenas de decision encadenadas sobre evidencia estructurada.
- Frontera defensiva frente a inyeccion de prompts en metadatos de paquetes.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta vision, audio ni otras modalidades; es exclusivamente texto.
- No debe usarse como chatbot de proposito general ni como motor de consulta ad hoc de CVE.

## Casos de uso

- Veredicto automatizado en pipelines de CI/CD: el modelo recibe el JSON de hallazgos de un escaner determinista y devuelve una decision tipada (`ALLOW`/`WARN`/`BLOCK`/`REVIEW`); es adecuado porque su salida es estructurada y su axioma «desconocido no es seguro» convierte feeds no consultados en `REVIEW` en lugar de aprobaciones silenciosas.
- Triaje de avisos de seguridad para equipos de desarrollo: a partir de un aviso de OSV o GitHub Advisory, genera una explicacion en lenguaje natural de la exposicion real y del rango de versiones afectadas, sin inventar identificadores ni contexto que no este en la evidencia.
- Revision de actualizaciones de dependencias en pull requests: dado un salto de version mayor, razona sobre el riesgo de ruptura y propone la version parcheada objetivo, integrándose como comentario automatico en la revision.
- Auditoria de scripts de ciclo de vida en el registro npm: distingue scripts de compilacion estandar (`node-gyp rebuild`) de patrones de exfiltracion (`curl | sh`), generando alertas de cuarentena en lugar de acusaciones de malware.
- Deteccion de typosquatting y paquetes sospechosos: ante candidatos generados por similitud de nombre y edad de paquete muy baja, clasifica el caso como revision cuarentenaria con la evidencia disponible.
- Cumplimiento de licencias en proyectos comerciales: contrasta la licencia declarada de cada dependencia con la politica del proyecto y senala conflictos de copyleft reciproco antes de la fusion de una rama.
- Filtro de admision en agentes autonomos de gestion de dependencias: actua como capa de decision previa a cualquier instalacion, bloqueando la ejecucion no supervisada cuando la evidencia es incompleta.
- Enriquecimiento de informes de composicion de software (SBOM): convierte listados planos de dependencias en informes priorizados por severidad y accion recomendada.

## Benchmarks y rendimiento

La model card publica una evaluacion sobre un conjunto retenido de 100 escenarios (`datasets/eval.json`). La tabla mostrada en la informacion disponible aparece truncada, por lo que solo se reproducen las filas completas:

| Metrica de evaluacion | Valor medido | Significado declarado |
|---|---|---|
| Decision Accuracy | 98,0% | Triaje correcto en escenarios seguros, vulnerables, obsoletos y de caso limite |
| Risk Level Accuracy | 100,0% | Alineacion exacta con los niveles de severidad de referencia |
| Security Precision | 100,0% | Cero falsas alarmas en dependencias verificadas como seguras |
| Security Recall | 100,0% | Cero vulnerabilidades omitidas en dependencias afectadas |
| False Negative Rate (FNR) | 0,00% | Garantia de seguridad declarada: ningun paquete peligroso permitido |
| Metricas adicionales | no disponibles | La tabla original continuaba mas alla del punto de corte de la informacion recuperada |

No se han publicado en la informacion disponible resultados de benchmarks estandar independientes (MMLU, HumanEval, GSM8K ni equivalentes), ni evaluaciones por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bfloat16 (0,49B parametros mas overhead de activaciones y KV cache), cerca de 0,5 GB en int8 y en torno a 0,3-0,4 GB en int4, para contextos de 2048-4096 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. No se requiere A100 ni H100 para inferencia.
- Cabe sin problema en GPU de consumo: RTX 4090, RTX 3090, RTX 3060, GTX 1660 (6 GB) e incluso iGPU con memoria compartida suficiente. Tambien es viable en CPU y en dispositivos de borde.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador LoRA, vLLM, TGI, llama.cpp y Ollama previa conversion del adaptador al formato GGUF correspondiente. La model card declara `inference: false` en el frontmatter, por lo que la inferencia gestionada en HuggingFace no esta habilitada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano (0,5B) y una ventana de 2048-4096 tokens, cabe esperar latencias de decenas de milisegundos por respuesta en GPU de consumo, pero no hay cifras publicadas que lo confirmen.
- El tamano del repositorio figura como 0,0 GB, lo que sugiere que los pesos pueden no estar materializados en el repositorio en el momento de la consulta; conviene verificarlo antes de planificar un despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deplyze-Mini | ~0,49B + 4,2M (LoRA) | 2048-4096 tokens | Especializado en dependencias y cadena de suministro | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en la fecha de consulta |
| Qwen2.5-0.5B-Instruct (modelo base) | ~0,49B | No disponible en la informacion proporcionada | Asistente generalista y multilingue | Apache 2.0 | Ampliamente disponible |
| Deplyze-Mini 1.5B (variante declarada) | ~1,5B + adaptador | 2048-4096 tokens segun receta | Especializado en dependencias y cadena de suministro | Apache 2.0 | Declarada como configurable; no confirmada como publicacion independiente |
| Deplyze-Mini 3B (variante declarada) | ~3B + adaptador | 2048-4096 tokens segun receta | Especializado en dependencias y cadena de suministro | Apache 2.0 | Declarada como configurable; no confirmada como publicacion independiente |

No se han identificado en la informacion disponible otros modelos especializados en razonamiento de dependencias y cadena de suministro con los que establecer una comparacion directa.

## Limitaciones y advertencias

- El modelo no debe emplearse como chatbot de proposito general: la model card excluye explicitamente conocimiento general, trivia y preguntas de programacion no relacionadas con dependencias.
- Dependencia obligatoria de hechos de escaneo deterministas: sin la salida de un escaner (Deplyze, OSV, lockfiles), el modelo carece de base factual y su axioma «desconocido no es seguro» lo lleva a `REVIEW` en lugar de a una respuesta util.
- Riesgo de alucinacion en identificadores CVE/GHSA si se le pide actuar como motor de consulta de vulnerabilidades; ese uso esta prohibido por el autor.
- No puede declarar un paquete «100% seguro»: la ausencia de evidencia nunca se trata como evidencia de ausencia, lo que limita su utilidad como certificador.
- Prohibido el uso para ejecutar scripts de paquetes no confiables o instalar paquetes de forma autonoma sin supervision humana o de politicas.
- Cobertura linguistica limitada al ingles; no se declara soporte de castellano ni de otros idiomas.
- Ventana de contexto corta (2048-4096 tokens), lo que restringe el tamano de los arboles de dependencias o informes que puede procesar en una sola pasada.
- Las cifras de evaluacion provienen del propio autor sobre un conjunto retenido de 100 escenarios generados proceduralmente; no hay validacion independiente y el conjunto puede compartir sesgos de distribucion con el generador de escenarios.
- La tabla de benchmarks de la model card esta truncada en la informacion disponible, por lo que podria haber metricas adicionales no verificadas.
- La model card incluye una declaracion de cero fuga de datos (0,0% de solapamiento entrenamiento/evaluacion) basada en hashing de huellas, no verificable de forma externa.
- El repositorio muestra 0 descargas, 0 likes y un tamano de 0,0 GB, lo que indica un modelo recien publicado y posiblemente sin pesos subidos; la ausencia de adopcion implica ausencia de validacion por la comunidad.
- El frontmatter declara `inference: false`, por lo que no hay endpoint de inferencia gestionado disponible en HuggingFace.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con las obligaciones habituales de atribucion y conservacion de avisos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mosetireagan/deplyze-mini
- Dataset de entrenamiento: https://huggingface.co/datasets/mosetireagan/deplyze-mini-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Deplyze (herramienta de escaneo referenciada): https://deplyze.dev
- Open Source Vulnerabilities (OSV): https://osv.dev
- GitHub Advisory Database: https://github.com/advisories
- SPDX License List: https://spdx.org/licenses/
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a articulos en aleman sobre el historial de fiabilidad de Windows, sin relacion con Deplyze-Mini.
