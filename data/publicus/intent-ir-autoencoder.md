# Publicus/intent-ir-autoencoder

## Resumen

Publicus/intent-ir-autoencoder es un checkpoint experimental de 384 dimensiones publicado por Publicus en Hugging Face. Se define como un autoencoder para un IR de intención, orientado a lógica formal y etiquetado con ipfs-datasets-py. No es el compilador simbólico por defecto, ni un formalizador verificado, ni una política de reparación de seguridad: todos los indicadores de cualificación, admisión y autoridad de prueba permanecen en falso y no se ejecuta ningún fallback a LLM o proveedor externo.

El artefacto consume embeddings de 384 dimensiones de thenlper/gte-small en un commit concreto y rechaza entradas de más de 512 tokens sin truncarlas. Su entrenamiento usa cabezas nativas con 12 filas autoradas de entrenamiento y 2 de ajuste por cabeza, además de herencia de tensores no léxicos de una cabeza Legal 384D. Declara 0/2 en reconstrucción exacta de IR en held-out y 2/2 en validez estructural nativa, pero los ejemplos son paráfrasis autoradas con objetivos semánticos compartidos con el entrenamiento, no un benchmark independiente. Es relevante como artefacto de desarrollo reproducible para investigar representaciones de intención y formalización, no como componente listo para producción; acumula 0 descargas y 0 likes, y su licencia no es unificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder con cabezas nativas (Security, Intent, UI/UX y Legal) sobre embeddings de 384 dimensiones; entrada mediante thenlper/gte-small |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de entrada; rechaza entradas superiores sin truncamiento |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | No unificada: runtime AGPL-3.0; exportación de fixtures autorada Apache-2.0; sin nueva concesión para pesos heredados |
| Formato de pesos | no disponible; el checkpoint se publica con manifiesto y SHA256, y no incluye los pesos del encoder de embeddings |
| Dimensión de embeddings | 384 |
| Encoder de embeddings | thenlper/gte-small, commit 17e1f347d17fe144873b1201da91788898c639cd; pesos no incluidos |
| Runtime | ipfs_datasets_py.logic.intent_ir.open_autoencoder; requiere fuentes verificadas y rechaza fuentes incompatibles |
| Versión del release | releases/20261002-384-development-v1/ |
| SHA256 del manifiesto | 250b6bf9cd93e32ee2db77498432d4dc5c7d705f333f9d99e92de69cdf2c727f |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder de intención que opera sobre representaciones de 384 dimensiones producidas por thenlper/gte-small en el commit 17e1f347d17fe144873b1201da91788898c639cd. La inferencia de origen exige los activos locales verificados del encoder correspondiente y rechaza entradas de más de 512 tokens sin truncamiento. La implementación instalada de ipfs_datasets_py debe coincidir con los hashes de origen del checkpoint; las fuentes incompatibles se rechazan. El runtime de desarrollo se implementa en el checkout del workspace correspondiente y no se declara incluido en una release existente de PyPI. No se ejecuta código Python suministrado por el repositorio durante la descarga.

En entrenamiento, las cabezas Security, Intent y UI/UX heredan todos los tensores no léxicos compatibles de una cabeza Legal 384D ya entrenada. Las nuevas filas léxicas usan medias de filas del padre entrenado, sin parámetros aleatorios en su estado inicial transferido. Cada cabeza nativa usó 12 filas autoradas de entrenamiento, 2 filas de ajuste, 500 épocas y 1000 actualizaciones del optimizador; la selección se hizo solo con la pérdida de ajuste. Las salidas son fragmentos tipados locales, no programas verificados completos ni documentos nativos. Los fragmentos de operadores de seguridad siguen necesitando su programa contenedor y el contexto de referencias de origen. La cabeza Legal conserva un núcleo disperso separado y una cabeza de fórmula aprendida con características derivadas de parser. Estos checkpoints no se entrenaron con los corpus completos CVEFixes o SkillCenter, y el experimento separado de familia estructural completa (rutas 15/9/8/6) no mide este decoder de origen 384D ni constituye su pérdida o cobertura de entrenamiento. Las ablaciones de pesos y condicionamiento demuestran dependencia numérica, no significado correcto.

## Capacidades

- Generación de fragmentos tipados locales de IR de intención a partir de texto y embeddings de 384 dimensiones.
- Reconstrucción de IR: 0/2 en held-out exacto y 2/2 en validez estructural nativa sobre paráfrasis autoradas con solapamiento semántico con el entrenamiento.
- Cabezas diferenciadas para Security, Intent, UI/UX y Legal; la cabeza Legal mantiene núcleo disperso y cabeza de fórmula con características de parser.
- No es compilador simbólico por defecto, formalizador verificado ni política de reparación de seguridad.
- No autoriza acciones: cualificación, admisión y autoridad de prueba permanecen falsas.
- No ejecuta fallback a LLM ni a proveedor externo.
- Entrada limitada a 512 tokens; rechaza entradas superiores sin truncamiento.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación en representaciones de intención: convertir textos cortos en fragmentos IR tipados para estudiar la alineación entre semántica y estructura. Es adecuado porque expone salidas locales tipadas y un manifiesto reproducible, pero debe usarse solo en desarrollo y sin autorizar acciones.
- Evaluación de pipelines de formalización: comparar la reconstrucción IR del autoencoder con compiladores simbólicos o formalizadores, midiendo exactitud y validez estructural. Su resultado declarado 0/2 en reconstrucción exacta sirve como línea base negativa, no como autoridad de prueba.
- Análisis estático asistido en seguridad: generar fragmentos de operadores de seguridad que después se integran en un programa contenedor y se contrastan con referencias de origen. Es útil como señal auxiliar en prototipos, nunca como política de reparación automática.
- Prototipos de análisis legal: usar la cabeza Legal con núcleo disperso y características de parser para experimentar con extracción de fórmulas y fragmentos legales, sin esperar documentos nativos completos.
- Diseño de interfaces UI/UX: mapear intenciones de usuario a fragmentos tipados en asistentes experimentales, con revisión humana obligatoria antes de cualquier efecto.
- Auditoría de robustez de autoencoders formales: reproducir ablaciones de pesos y condicionamiento para comprobar dependencia numérica y detectar cuándo la salida es plausible pero semánticamente incorrecta.
- Verificación de procedencia en CI: validar el commit del encoder, los hashes de origen de ipfs_datasets_py y el SHA256 del manifiesto antes de admitir el checkpoint en un pipeline, rechazando fuentes incompatibles.
- Generación de fixtures para pruebas: producir fragmentos tipados controlados que sirvan como datos de prueba en tests de integración, siempre que no se presenten como benchmark independiente ni como verdad formal.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| Reconstrucción exacta de IR en held-out | 0/2 | Paráfrasis autoradas con objetivos semánticos compartidos con entrenamiento; no benchmark independiente |
| Validez estructural nativa | 2/2 | Paráfrasis autoradas con objetivos semánticos compartidos con entrenamiento; no benchmark independiente |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K u otros conjuntos estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se especifican parámetros totales ni tamaño de pesos. Requiere además los activos del encoder thenlper/gte-small, cuyos pesos no están incluidos.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no disponible; no hay datos de VRAM ni de cuantizaciones.
- Opciones de despliegue: integración prevista mediante ipfs_datasets_py.logic.intent_ir.open_autoencoder; no se documentan vLLM, llama.cpp, Ollama ni TGI. El runtime de desarrollo se sitúa en el checkout del workspace y no se declara en una release de PyPI.
- Latencia y throughput: no disponible.
- Restricción de entrada: rechaza entradas de más de 512 tokens sin truncamiento.
- Requisitos de integridad: ipfs_datasets_py debe coincidir con los hashes de origen; fuentes incompatibles se rechazan. No se ejecuta Python suministrado por el repositorio durante la descarga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Publicus/intent-ir-autoencoder | no disponible | 512 tokens | No unificada: AGPL-3.0 / Apache-2.0 / sin nueva concesión para pesos heredados | Hugging Face; 0 descargas, 0 likes | 0/2 reconstrucción exacta IR; 2/2 validez estructural nativa |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No disponible: la información proporcionada no identifica modelos comparables de la misma categoría ni ofrece métricas frente a alternativas.

## Limitaciones y advertencias

- No autoriza acciones: todos los flags de cualificación, admisión y autoridad de prueba son falsos.
- No es el compilador simbólico por defecto, ni un formalizador verificado, ni una política de reparación de seguridad.
- Riesgo alto de candidatos plausibles pero semánticamente incorrectos: la reconstrucción exacta de IR en held-out es 0/2.
- Los 2/2 de validez estructural nativa proceden de paráfrasis autoradas con objetivos semánticos compartidos con el entrenamiento; no son un benchmark real independiente.
- No se entrenó con los corpus completos CVEFixes o SkillCenter.
- El experimento separado de familia estructural completa (15/9/8/6 rutas) no mide este decoder 384D; no debe usarse como su pérdida o cobertura.
- Las ablaciones de pesos y condicionamiento demuestran dependencia numérica, no significado correcto.
- La entrada se limita a 512 tokens y rechaza longitudes superiores sin truncamiento.
- El encoder de embeddings no está incluido; se requieren activos locales verificados.
- ipfs_datasets_py debe coincidir con los hashes del checkpoint; fuentes incompatibles se rechazan.
- El runtime de desarrollo no se declara en una release de PyPI existente.
- Licencia no unificada: runtime AGPL-3.0, exportación de fixtures Apache-2.0, sin nueva concesión para pesos heredados; la licencia del corpus no se afirma como licencia de pesos.
- No hay datos de sesgos, idiomas soportados, cuantizaciones, benchmarks estándar, latencia o throughput.
- Los fragmentos de seguridad requieren programa contenedor y contexto de referencias de origen.
- Acumula 0 descargas y 0 likes, lo que limita la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Publicus/intent-ir-autoencoder
- Commit del encoder thenlper/gte-small: https://huggingface.co/thenlper/gte-small/commit/17e1f347d17fe144873b1201da91788898c639cd
- Manifiesto SHA256: 250b6bf9cd93e32ee2db77498432d4dc5c7d705f333f9d99e92de69cdf2c727f
- Release interna: releases/20261002-384-development-v1/ (no se proporciona URL)
- Repositorio del runtime: no disponible en la información proporcionada
- Paper, blog, demo o repositorio adicional: no disponible en la información proporcionada
- ipfs_datasets_py: no se proporciona URL; la integración se realiza mediante ipfs_datasets_py.logic.intent_ir.open_autoencoder
