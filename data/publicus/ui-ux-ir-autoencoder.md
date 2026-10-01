# Publicus/ui-ux-ir-autoencoder

## Resumen

Publicus/ui-ux-ir-autoencoder es un checkpoint experimental de 384 dimensiones desarrollado por Publicus que implementa un autoencoder sobre embeddings de texto. El modelo no opera sobre tokens directamente, sino sobre vectores de 384 dimensiones generados por el encoder `thenlper/gte-small` (commit `17e1f347d17fe144873b1201da91788898c639cd`), y su salida son fragmentos tipados locales de representación intermedia (IR), no documentos completos ni programas verificados. Dispone de tres cabezas funcionales: Security, Intent y UI/UX, todas heredadas de una cabeza Legal 384D previamente entrenada.

El artefacto se presenta explícitamente como un recurso de desarrollo opt-in, no como un compilador simbólico por defecto, ni como un formalizador verificado, ni como una política de reparación de seguridad. Todas las banderas de cualificación, admisión y autoridad de prueba permanecen en falso, y no se ejecuta ningún mecanismo de respaldo basado en LLM o proveedor externo. La model card advierte que el modelo genera candidatos plausibles pero semánticamente incorrectos y que no debe utilizarse para autorizar acciones.

Su relevancia es acotada y experimental: sirve para estudiar si un autoencoder entrenado sobre embeddings densos puede mapear texto fuente a fragmentos IR tipados en dominios de seguridad, intención y experiencia de usuario. Las métricas publicadas son muy limitadas (reconstrucción exacta IR retenida 0/2; validez estructural nativa 2/2) y provienen de ejemplos de paráfrasis con objetivos semánticos compartidos con el entrenamiento, por lo que no constituyen una evaluación real independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder sobre embeddings densos de 384 dimensiones (entrada: `thenlper/gte-small`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens como maximo del encoder; las entradas superiores se rechazan sin truncado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos del Hub; la model card indica que el repositorio de runtime conserva AGPL-3.0, la exportacion de fixtures declara Apache-2.0 y no se concede nueva licencia sobre los pesos heredados |
| Formato de pesos | no disponible (se distribuye como checkpoint con manifiesto de hashes SHA256; no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

La arquitectura consiste en un autoencoder que consume embeddings de 384 dimensiones producidos por `thenlper/gte-small` y produce fragmentos IR tipados de alcance local. El modelo incluye tres cabezas: Security, Intent y UI/UX, que heredan todos los tensores no léxicos compatibles de una cabeza Legal 384D entrenada previamente. Las nuevas filas léxicas se inicializan con las medias de las filas padre entrenadas, de modo que no quedan parámetros aleatorios en su estado inicial transferido. Legal conserva su núcleo disperso separado y una cabeza de fórmulas aprendida con características derivadas de parser.

El entrenamiento de cada cabeza nativa utilizó 12 filas de entrenamiento y 2 filas de ajuste, con 500 épocas / 1000 actualizaciones de optimizador, y la selección se realizó únicamente mediante la pérdida de ajuste. Las salidas son fragmentos tipados locales explícitos, no programas verificados completos ni documentos nativos; los fragmentos de operador de seguridad siguen requiriendo su programa contenedor y su contexto de referencia de fuente. Los checkpoints no se entrenaron con los corpus completos CVEFixes ni SkillCenter, y el experimento separado de familia estructural de características completas (rutas 15/9/8/6) no mide este decodificador de fuente 384D ni constituye su pérdida de entrenamiento o cobertura. Las ablaciones de pesos y condicionamiento demuestran dependencia numérica, no significado correcto.

## Capacidades

- Generación de fragmentos IR tipados de alcance local a partir de embeddings de texto, no de texto libre.
- Tres cabezas funcionales diferenciadas: Security, Intent y UI/UX.
- Inferencia sobre vectores de 384 dimensiones mediante `model.infer(...)` o sobre texto mediante `model.infer_texts(...)` con una instantánea verificada de `gte-small`.
- Rechazo explícito de entradas que superan los 512 tokens sin truncado.
- Verificación de integridad de fuentes: la implementación de `ipfs_datasets_py` instalada debe coincidir con los hashes del checkpoint, y las fuentes incompatibles se rechazan.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni generación conversacional multilingüe.
- No dispone de modo de pensamiento (thinking mode).

## Casos de uso

- Investigación en compilación simbólica: evaluar experimentalmente si un autoencoder sobre embeddings puede mapear texto fuente a fragmentos IR tipados. Adecuado únicamente como banco de pruebas, dado que la reconstrucción exacta IR retenida es 0/2.
- Estudio de transferencia de pesos entre cabezas: analizar el comportamiento de las cabezas Security, Intent y UI/UX al heredar tensores de una cabeza Legal 384D, mediante las ablaciones de pesos y condicionamiento documentadas.
- Análisis de seguridad asistido en fase de investigación: generación de fragmentos de operador de seguridad que, según la model card, siguen requiriendo su programa contenedor y contexto de referencia. No debe emplearse para autorizar reparaciones.
- Etiquetado UI/UX experimental: producir fragmentos IR asociados a interfaz de usuario dentro de un pipeline de prototipado, siempre con validación humana posterior y sin uso en producción.
- Reproducción de pipelines de formalización: servir como componente de referencia en entornos donde se valide la coincidencia de hashes de `ipfs_datasets_py` y de los activos del encoder.
- Evaluación de robustez de embeddings de 384 dimensiones: medir cómo se comporta un decodificador sobre vectores de `gte-small` con entradas cerca del límite de 512 tokens.
- Auditoría de gobernanza de artefactos: usar el manifiesto y el SHA256 (`8faf96d5f3deb284cc2a0e8065c6c9c5a9e9983e097b9f205d4b93c1431f0f2e`) para verificar procedencia e inmutabilidad de checkpoints en flujos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica publicada por el autor es la siguiente, referida a ejemplos de paráfrasis con objetivos semánticos compartidos con el entrenamiento y no a tareas independientes del mundo real:

| Metrica | Resultado | Nota |
|---|---|---|
| Reconstruccion exacta IR retenida | 0/2 | Ejemplos de paráfrasis con objetivos semánticos compartidos con el entrenamiento |
| Validez estructural nativa | 2/2 | Ejemplos de paráfrasis con objetivos semánticos compartidos con el entrenamiento |

## Requisitos de hardware

- No se publican requisitos de hardware específicos. Como estimación basada en el encoder de entrada `thenlper/gte-small` (aproximadamente 33 millones de parámetros, 384 dimensiones) y en un autoencoder sobre vectores de 384D, la huella sería muy reducida, muy inferior a 1 GB de VRAM, aunque este dato no está confirmado por el autor.
- GPU recomendadas: no disponible. Por el tamaño del encoder, la inferencia sería viable en CPU y en cualquier GPU consumer, pero esto es una inferencia y no un dato publicado.
- Compatibilidad con GPU consumer: probablemente sí, aunque no confirmado.
- Opciones de despliegue: no aplican las herramientas habituales de LLM (vLLM, llama.cpp, Ollama, TGI) porque no es un modelo generativo de tokens. El despliegue se realiza a través de la biblioteca `ipfs_datasets_py`, mediante la API `from ipfs_datasets_py.logic.ui_ux_ir import open_autoencoder`, que fija un commit completo del Hub y un SHA256.
- Latencia y throughput estimados: no disponible.
- Requiere activos de encoder locales verificados (instantánea de `gte-small`); los pesos del encoder no se incluyen en la distribución.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada: se trata de un artefacto experimental específico de Publicus (autoencoder sobre embeddings de 384 dimensiones para IR formal) y sin benchmarks publicados. Los resultados de la búsqueda web corresponden a proyectos distintos y no relacionados, que conviene no confundir:

| Elemento | Relacion con este modelo |
|---|---|
| afx-team/UI-UX (LLM multimodal de 4B para UX móvil, en GitHub) | Proyecto independiente y no relacionado; comparte nombre parcial "UI-UX" |
| Deepractice/UIX (capa de protocolo IR para UI) | Proyecto independiente y no relacionado; comparte concepto de IR pero no autoría ni código |
| publicus.ai (plataforma de inteligencia de contratación pública canadiense) | Empresa no relacionada; comparte el nombre "Publicus" |
| thenlper/gte-small | No es un modelo comparable, sino el encoder de entrada del que dependen los embeddings de 384D |

## Limitaciones y advertencias

- El propio autor indica que el modelo genera candidatos plausibles pero semánticamente incorrectos y que no debe autorizar acciones.
- No es el compilador simbólico por defecto, no es un formalizador verificado y no es una política de reparación de seguridad; todas las banderas de cualificación, admisión y autoridad de prueba permanecen en falso.
- La reconstrucción exacta IR retenida es 0/2, lo que indica un fallo de reconstrucción en la evaluación publicada.
- La validez estructural nativa de 2/2 procede de ejemplos de paráfrasis con objetivos semánticos compartidos con el entrenamiento, por lo que no constituye una evaluación independiente.
- El entrenamiento por cabeza es extremadamente reducido (12 filas de entrenamiento, 2 de ajuste, 500 épocas / 1000 actualizaciones), lo que limita severamente la generalización.
- Los checkpoints no se entrenaron con los corpus completos CVEFixes ni SkillCenter, por lo que no cabe esperar cobertura de esos dominios.
- Las ablaciones de pesos y condicionamiento demuestran dependencia numérica, no significado correcto.
- Las entradas superiores a 512 tokens se rechazan sin truncado, lo que restringe la longitud de la fuente procesable.
- No se ejecuta ninguna estrategia de respaldo basada en LLM o proveedor externo.
- Licencia: los metadatos del Hub no declaran licencia; la model card señala que no se concede nueva licencia sobre los pesos heredados, que el repositorio de runtime conserva AGPL-3.0 y que la exportación de fixtures declara Apache-2.0 de forma separada. La licencia de un corpus no se afirma como licencia de los pesos. Antes de cualquier uso comercial debe verificarse la situación legal de los pesos heredados.
- Integridad: la implementación de `ipfs_datasets_py` instalada debe coincidir con los hashes del checkpoint; fuentes incompatibles son rechazadas. No se ejecuta Python proporcionado por el repositorio durante la descarga.
- El runtime de desarrollo está implementado en el checkout de workspace correspondiente y no se afirma que esté disponible en una versión publicada de PyPI.
- Idiomas soportados: no disponible.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: documentado explícitamente por el autor en forma de candidatos plausibles semánticamente incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Publicus/ui-ux-ir-autoencoder
- Perfil de la organización en Hugging Face: https://huggingface.co/publicus-ai/models
- Encoder de entrada (dependencia): https://huggingface.co/thenlper/gte-small
- Repositorio no relacionado con nombre similar: https://github.com/afx-team/UI-UX
- Repositorio no relacionado con nombre similar: https://github.com/Deepractice/UIX
- Sitio de la empresa no relacionada con nombre similar: https://publicus.ai/
- Documentación de la empresa no relacionada: https://publicus.ai/docs
- Manifiesto SHA256 del checkpoint: `8faf96d5f3deb284cc2a0e8065c6c9c5a9e9983e097b9f205d4b93c1431f0f2e`
