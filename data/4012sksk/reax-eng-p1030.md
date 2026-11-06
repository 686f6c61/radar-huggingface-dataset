# 4012sksk/reax-eng-p1030

## Resumen

REAX p1030 BMR validation source V3 es un artefacto publicado en Hugging Face por el usuario 4012sksk bajo el identificador `4012sksk/reax-eng-p1030`. La model card no describe un modelo de lenguaje en el sentido convencional: se presenta como un repositorio de validación ("BMR validation source") asociado a un candidato diagnóstico UID235 y a una imagen de contenedor `ghcr.io/dpmoomin/p235`. El contenido declarado son fuentes, hashes y metadatos de release, no pesos de modelo.

El documento menciona componentes denominados "mammoth", "blink" y "reax1", con rutas de ejecución y puntuaciones de componentes locales (por ejemplo, Blink con perfil DUAL0 y score aproximado de 2,847459; REAX1 con score de 1,2977194). También declara explícitamente un fallo de Vision en la comprobación local original (media 0,591986, máximo 3,71588 por encima de 1,0, acuerdo top 0,978516), por lo que Vision no se declara para esta release.

No se dispone de información sobre arquitectura de red neuronal, número de parámetros, longitud de contexto, tokenizador ni datos de entrenamiento. La relevancia del artefacto es, por tanto, documental y de trazabilidad de licencias y linaje (parent UID208), no la de un modelo evaluable para inferencia. Cualquier uso como modelo de lenguaje requeriría verificar primero que los pesos existen y son accesibles, algo que la model card no confirma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | reax-engine-1.1-and-apache-2.0-and-mit (otra, con enlace a SOURCE_LICENSES.md) |
| Formato de pesos | no disponible (el archivo publicado es `PROBE235_SOURCE_V3.zip.b64`, un archivo de fuentes codificado en base64, no pesos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), ni sobre el número de tokens de entrenamiento, la composición del dataset o el uso de RLHF/DPO. La model card se limita a describir un proceso de validación y empaquetado de fuentes: el archivo `PROBE235_SOURCE_V3.zip.b64` debe decodificarse de base64 y verificarse su SHA contra `SOURCE_SEAL_V3.json` antes de inspeccionar fuentes, hashes, licencias y evidencias.

Los únicos datos técnicos declarados son de naturaleza operativa: la ruta de ejecución usa `/opt/venv/bin/python`, REAX1 emplea "exactR6 joint-v3 native source", Blink usa el perfil fijo MM2 DUAL0 con memory 0.45 y TD1/HEAD1, y Mammoth reenvía la entrada del padre original. Se menciona que los bytes de runtime no cambian respecto a la V1 pública y que la V3 solo modifica metadatos y documentación para omitir Vision. No hay innovaciones de arquitectura descritas (atención lineal, decodificación especulativa, etc.).

## Capacidades

- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- La model card indica explícitamente que Vision no está declarada para esta release y que la comprobación local original falló.
- No se declara soporte de agentes, multi-step reasoning ni function calling.
- No se declaran capacidades multilingües ni idiomas soportados.
- El artefacto funcional declarado es la validación de fuentes y la verificación de hashes del linaje UID208, no la inferencia.

## Casos de uso

- Auditoría de procedencia de artefactos: descargar `PROBE235_SOURCE_V3.zip.b64`, decodificarlo y verificar el SHA del ZIP contra `SOURCE_SEAL_V3.json` para confirmar la integridad del release.
- Trazabilidad de licencias: inspeccionar `SOURCE_LICENSES.md` para confirmar la convivencia de REAX Engine License 1.1, Apache 2.0 y MIT, y la exención explícita para minería/validación de subnet 92.
- Reproducción de validación BMR: usar las fuentes nativas y los 15 outputs byte-idénticos incluidos o vinculados por hash para reproducir la comprobación de componentes.
- Verificación de linaje: contrastar los 138 ficheros del parent UID208 contra la imagen `ghcr.io/elninolab/v2-dm18n@sha256:356b...` para confirmar la relación padre-hijo.
- Registro de fallos conocidos: documentar el fallo de Vision (media 0,591986, máximo 3,71588, acuerdo top 0,978516) como evidencia negativa en un pipeline de cualificación.
- Integración en CI de imágenes: usar la imagen `ghcr.io/dpmoomin/p235` junto con las comprobaciones de hash para validar despliegues en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye puntuaciones de componentes locales (Blink aproximadamente 2,847459; REAX1 1,2977194) que el propio autor califica como observaciones locales que no establecen un compuesto de misma imagen, cualificación oficial, limpieza de línea parental ni estatus de campeón.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican pesos ni arquitectura).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; el artefacto es un ZIP de fuentes codificado en base64 y una imagen de contenedor en `ghcr.io/dpmoomin/p235`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque el artefacto no se presenta como un modelo de lenguaje con parámetros y contexto definidos, sino como un paquete de validación y fuentes con licencia compuesta.

## Limitaciones y advertencias

- La model card declara un fallo conocido de Vision en la comprobación local original; Vision no está soportada en esta release.
- El autor indica que las puntuaciones de componentes locales no constituyen cualificación oficial ni estatus de campeón; se requieren las puertas oficiales originales y dos confirmaciones nuevas.
- No se distribuyen pesos de modelo, credenciales, material de wallet ni payloads privados; el contenido es fuente y metadatos.
- La licencia es compuesta (REAX Engine License 1.1, Apache 2.0 y MIT) con condiciones específicas; la exención para subnet 92 no implica exención general para uso comercial. Es necesario revisar `SOURCE_LICENSES.md` antes de cualquier uso en producción.
- Riesgo de confusión: el identificador y la estructura podrían interpretarse como un modelo desplegable, pero no hay evidencia de pesos ni de pipeline de inferencia.
- No se declaran idiomas soportados, sesgos conocidos ni tasas de alucinación porque no hay modelo evaluable en la información disponible.
- La fecha de creación indicada (2026-10-30) es posterior a la fecha actual de referencia habitual; conviene verificar la coherencia temporal del repositorio antes de confiar en sus metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/4012sksk/reax-eng-p1030
- Licencias de fuentes: https://huggingface.co/4012sksk/reax-eng-p1030/blob/main/SOURCE_LICENSES.md
- Fuente engcomp (MetaTrendLab): https://github.com/MetaTrendLab/engcomp/tree/574bc63e632e0f775d2fdc9cd4904d3fbd76ecad
- Fuente reax-engine (reaxlabs): https://github.com/reaxlabs/reax-engine/tree/4230e50e8b5247f113f7c4b55c6d1c4efa7c2e94
- Imagen de contenedor runtime: `ghcr.io/dpmoomin/p235`
- Imagen parent UID208: `ghcr.io/elninolab/v2-dm18n@sha256:356b770cc7d7eb3c5f0728c01a8b005eb7597dc4bdde8f07637d3a6d5bfbd009`
