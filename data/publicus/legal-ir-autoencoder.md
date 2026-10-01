# Publicus/legal-ir-autoencoder

## Resumen

Publicus/legal-ir-autoencoder es un checkpoint experimental de un autoencoder con espacio latente de 384 dimensiones, desarrollado por Publicus y orientado a la representación intermedia (IR) de texto legal y de seguridad dentro de un flujo de compilación simbólica hacia lógica formal. El artefacto se publica como un componente opt-in de desarrollo, no como el compilador simbólico por defecto ni como formalizador verificado, y todas sus banderas de cualificación, admisión y autoridad de prueba permanecen en falso.

El modelo reutiliza embeddings de `thenlper/gte-small` (384 dimensiones, commit `17e1f347d17fe144873b1201da91788898c639cd`) como entrada y proyecta el texto hacia fragmentos tipados locales. Incluye cabezas diferenciadas para Legal, Security, Intent y UI/UX, que heredan tensores no léxicos de una cabeza Legal 384D entrenada localmente; las nuevas filas léxicas se inicializan con medias de filas del padre entrenado, sin parámetros aleatorios en su estado inicial transferido.

Su relevancia es acotada y muy específica: sirve como pieza de investigación y de integración temprana para pipelines que necesitan explorar la conversión de lenguaje natural a IR de lógica formal. No se reclama ninguna precisión nueva sobre conjuntos de validación retenidos, y el propio autor advierte de que las ablaciones demuestran dependencia numérica, no significado correcto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder con espacio latente de 384 dimensiones y cabezas multiples (Legal, Security, Intent, UI/UX); encoder de embeddings externo `thenlper/gte-small` |
| Parametros totales | no disponible |
| Longitud de contexto | 512 tokens (rechaza entradas superiores sin truncar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos de HuggingFace; el repositorio fuente del runtime conserva AGPL-3.0 y la exportacion de fixtures autorada declara Apache-2.0 por separado |
| Formato de pesos | no disponible; los pesos del encoder de embeddings no se incluyen en el paquete |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder sobre un espacio latente de 384 dimensiones que consume embeddings precalculados con `thenlper/gte-small`. Sobre ese cuello de botella se disponen varias cabezas: una cabeza Legal entrenada localmente con núcleo disperso (sparse core) y una cabeza de fórmulas aprendida con características derivadas de parser, más cabezas de Security, Intent y UI/UX que heredan todos los tensores no léxicos compatibles de la cabeza Legal 384D. Las filas léxicas nuevas se inicializan con medias de filas del padre entrenado, de modo que no queda ningún parámetro aleatorio en su estado inicial transferido. Las salidas son fragmentos tipados locales, no programas completos verificados ni documentos nativos.

El régimen de entrenamiento reportado es muy reducido: cada cabeza nativa usó 12 filas de entrenamiento autoradas, 2 filas de ajuste, 500 épocas y 1000 actualizaciones del optimizador, con selección basada únicamente en la pérdida de ajuste. La cabeza Legal retenida se reprodujo sobre cuatro fixtures de desarrollo, y las 32 entradas numéricas de entrenamiento y las 8 de ajuste coincidieron con sus manifiestos históricos antes de una bifurcación explícita de compatibilidad de vinculación de fuentes. Los checkpoints no se entrenaron sobre los corpus completos CVEFixes ni SkillCenter, y el experimento de familia estructural de características completas (rutas 15/9/8/6) no mide este decodificador de fuente 384D. El runtime exige que la implementación instalada de `ipfs_datasets_py` coincida con los hashes de fuente del checkpoint y rechaza fuentes incompatibles.

## Capacidades

- Generación de fragmentos tipados de IR (representación intermedia) a partir de texto, con orientación a lógica formal.
- Cabeza Legal con núcleo disperso y cabeza de fórmulas aprendida, apoyada en características derivadas de parser.
- Cabeza Security para fragmentos de operadores de seguridad, que requieren su programa contenedor y contexto de referencia de fuente.
- Cabezas Intent y UI/UX heredadas por transferencia de tensores no léxicos.
- Inferencia sobre embeddings de 384 dimensiones mediante `infer` o `infer_texts` con snapshot verificado de `gte-small`.
- Sin fallback a LLM ni a proveedores externos durante la ejecución.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni thinking mode.

## Casos de uso

- Investigación en compilación simbólica: usar el checkpoint como banco de pruebas para estudiar cómo un autoencoder de 384 dimensiones comprime texto legal en un espacio latente que alimenta un compilador simbólico posterior, sin reclamar validez de producción.
- Extracción experimental de fragmentos legales tipados: integrarlo en un prototipo que necesite segmentar cláusulas en fragmentos locales tipados, asumiendo que la salida no constituye un documento legal verificado.
- Análisis de operadores de seguridad en revisión de código asistida: emplear la cabeza Security para generar fragmentos de operadores que después deben ser envueltos por su programa y contexto de referencia antes de cualquier evaluación.
- Estudio de transferencia entre cabezas: analizar cómo se comporta la herencia de tensores no léxicos desde la cabeza Legal hacia Intent y UI/UX, y medir la dependencia numérica de las filas léxicas inicializadas por medias.
- Validación de pipelines de procedencia: utilizar el manifiesto inmutable (`releases/20261002-384-development-v1/`, SHA256 `34794ea4bbf128678eafdd8ba1862b58c8d0bf36b8ae83e20de75abf57e9debc`) para probar flujos de verificación de hashes de fuente y de assets de embeddings.
- Reproducción de experimentos de ablación: comparar el comportamiento del decodificador 384D frente al experimento de familia estructural de rutas 15/9/8/6 para documentar la diferencia de cobertura y pérdida.
- Integración temprana en herramientas legal-tech: incorporarlo como componente opcional en un entorno de desarrollo que necesite un IR intermedio, manteniendo las banderas de cualificación y autoridad de prueba en falso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna precisión nueva sobre conjuntos retenidos para este paquete, y que las ablaciones de pesos y condicionamiento demuestran dependencia numérica, no significado correcto.

## Requisitos de hardware

- El paquete no incluye los pesos del encoder de embeddings (`thenlper/gte-small`); el runtime exige assets de encoder locales verificados, por lo que hay que provisionar ese snapshot aparte.
- El espacio latente es de 384 dimensiones y el número de parámetros totales no está publicado, por lo que no se puede estimar con rigor la VRAM de inferencia.
- No se especifican GPU recomendadas ni si el modelo cabe en GPU de consumo; dado el tamaño del latente y de las cabezas descritas, es plausible que la inferencia del autoencoder sea ligera, pero se trata de una estimación no confirmada por el autor.
- El límite de 512 tokens por entrada condiciona el dimensionamiento del batching y del preprocesado.
- Opciones de despliegue: uso vía la API de Python `ipfs_datasets_py.logic.legal_ir.open_autoencoder`, con la implementación de `ipfs_datasets_py` fijada por hash; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (autoencoders de IR para lógica formal legal con espacio latente de 384 dimensiones y cabezas múltiples). Se trata de un artefacto experimental altamente específico sin alternativas directas documentadas.

## Limitaciones y advertencias

- Es un artefacto de desarrollo opt-in: no es el compilador simbólico por defecto, no es un formalizador verificado y no es una política de reparación de seguridad.
- Todas las banderas de cualificación, admisión y autoridad de prueba permanecen en falso.
- No se reclama precisión nueva sobre datos retenidos; la rejugada sobre cuatro fixtures de desarrollo no constituye una validación held-out.
- Las ablaciones de pesos y condicionamiento demuestran dependencia numérica, no corrección semántica.
- Los checkpoints no se entrenaron sobre los corpus completos CVEFixes ni SkillCenter; el experimento de familia estructural (rutas 15/9/8/6) no mide este decodificador 384D.
- Los fragmentos de operadores de seguridad requieren su programa contenedor y contexto de referencia de fuente; las salidas no son programas verificados ni documentos nativos.
- Límite estricto de 512 tokens por entrada, con rechazo (no truncado automático) de entradas superiores.
- Dependencia fuerte del entorno: la implementación de `ipfs_datasets_py` debe coincidir con los hashes de fuente del checkpoint, y se rechazan fuentes incompatibles; el runtime no está confirmado como publicado en una versión de PyPI.
- Los pesos del encoder de embeddings no se incluyen, por lo que la inferencia depende de assets locales verificados.
- Licencia ambigua: los metadatos de HuggingFace no declaran licencia; el repositorio fuente del runtime conserva AGPL-3.0 y la exportación de fixtures autorada declara Apache-2.0. No se concede una nueva licencia para los pesos heredados, y no se afirma que la licencia del corpus sea la licencia de los pesos. Cualquier uso comercial debe aclararse con el autor.
- Riesgo de alucinación en el sentido de generar fragmentos tipados plausibles pero incorrectos: el propio autor advierte que no hay garantía de significado correcto.
- No se documentan idiomas soportados; la cobertura lingüística es desconocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Publicus/legal-ir-autoencoder
- Encoder de embeddings de entrada: https://huggingface.co/thenlper/gte-small (commit `17e1f347d17fe144873b1201da91788898c639cd`)
- Manifiesto SHA256 del checkpoint: `34794ea4bbf128678eafdd8ba1862b58c8d0bf36b8ae83e20de75abf57e9debc` (ruta `releases/20261002-384-development-v1/`)
- Repositorio del runtime `ipfs_datasets_py`: no disponible en la informacion proporcionada
- Paper o blog técnico: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
