# c0mbatduckzz/TOM-GROK

## Resumen

TOM-GROK es un artefacto de investigación publicado en Hugging Face por el autor Tom Klootwijk bajo el identificador `c0mbatduckzz/TOM-GROK`. No se trata de un modelo de lenguaje en el sentido convencional, sino de una colección de documentación matemática, formalizaciones y código fuente (CUDA/WebGPU) que el autor describe como un "modelo computacional determinista de campo de operadores autorreferencial". El repositorio no contiene pesos de modelo: su tamaño es de 0,0 GB y la model card remite exclusivamente a PDFs, catálogos JSON y código de un intérprete denominado TK-EDGE-1.

El autor declara el artefacto como propiedad personal con todos los derechos reservados y sin licencia concedida de ningún tipo, prohibiendo explícitamente su uso, copia, modificación, distribución o empleo para entrenamiento de modelos. La publicación no incluye pipeline, arquitectura de red neuronal, parámetros, contexto ni datos de entrenamiento en el sentido habitual de la industria. Toda la información disponible es la que el propio autor proporciona en la model card y en los documentos enlazados.

Su relevancia actual es marginal desde el punto de vista técnico y de evaluación de modelos: no hay benchmarks, no hay pesos descargables y no hay licencia que permita uso alguno. Se documenta aquí como artefacto de investigación con fines de catalogación, advirtiendo de que no es utilizable como modelo de IA en producción ni en investigación sin autorización expresa del titular.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el autor describe "sistemas de transición tipados portadores de operadores" TK-SROF; no es una arquitectura de red neuronal declarada) |
| Parámetros totales | No disponible (el autor indica "descripciones explícitas de operadores: turnos, ganancias y tablas de reglas de cinta"; no se cuantifican parámetros) |
| Parámetros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Propietaria, todos los derechos reservados, sin licencia concedida (`proprietary`, `all-rights-reserved`, `no-license-granted`) |
| Formato de pesos | No disponible (el repositorio contiene PDFs, JSON, código CUDA y documentación; no se declaran pesos en safetensors, GGUF ni otros formatos) |

## Arquitectura y entrenamiento

La model card describe TOM-GROK como una familia de "sistemas de transición tipados portadores de operadores" (TK-SROF), con dos perfiles de ejecución: intérpretes de "pinion" TK-EDGE-1 y de cinta finita U-TAPE-1. El estado y las descripciones de operadores son explícitos, y la ejecución se realiza mediante el runtime TK-EDGE-1 incluido, con código fuente CUDA (`kernel/native/kernel.cu`) y soporte WebGPU. Se menciona una "mutación de operador/pinion de enteros acotados" y una ABI con estado empaquetado, genes tipados, orden lógico de eventos y reglas de commit.

No se documenta ningún proceso de entrenamiento: no hay número de tokens, composición de dataset, RLHF, DPO ni ajuste fino. El material asociado incluye un compendio matemático de 159 páginas con 56 perfiles de dominio y 94 fuentes, un compendio de control físico de 77 páginas y una formalización original de 29 páginas (TK-SROF-2.0). El autor menciona construcciones como el "acoplamiento doble de Hadamard", una "relación de autovector de rango uno" y álgebra de fase/orientación, presentadas como exposición matemática sin sección de revisión formal ni cambios de runtime.

## Capacidades

- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas o visión en el sentido de un modelo de lenguaje.
- El autor describe aplicaciones en modelos físicos, planificación robótica, conservación de reacciones, sensado y habla, contabilidad de experimentos cuánticos y búsqueda de algoritmos, siempre como construcciones matemáticas dentro de los compendios.
- Se menciona una arquitectura "laringe/símbolo-a-habla" y roles en 5G/FMCW/audio direccional, sin especificación técnica verificable en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de un LLM; el autor describe "computación autorreferencial" y "mutación de operadores".
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Catalogación de artefactos de investigación: el repositorio puede registrarse como artefacto documental (PDFs, JSON, código CUDA) en un archivo institucional, sin uso del contenido más allá de su referencia bibliográfica.
- Estudio de formalizaciones matemáticas: los compendios pueden consultarse como material de exposición sobre espacios de estado tipados y álgebra de operadores, siempre que el titular autorice la lectura más allá del acceso público.
- Análisis de código CUDA/WebGPU: el `kernel/native/kernel.cu` y la documentación de ABI pueden examinarse como ejemplo de intérprete de cinta finita, sujeto a la prohibición de uso y modificación del titular.
- Referencia en revisiones de licencias: el caso ilustra un artefacto publicado con restricciones propietarias explícitas, útil para estudiar prácticas de licenciamiento en Hugging Face.
- Documentación de provenance: los ficheros `AUTHOR.json`, `RELEASE.json` y `kernel/docs/provenance.json` pueden servir como ejemplo de trazabilidad de artefactos, sin reutilización del contenido.
- No se identifican casos de uso como modelo de IA en producción, atención al cliente, generación de código o pipelines de CI/CD, dado que no hay pesos ni licencia operativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos de modelo).
- GPU recomendadas: no disponible; el autor menciona ejecución mediante runtime CUDA/WebGPU, sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el despliegue declarado es el runtime TK-EDGE-1 incluido en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TOM-GROK | No disponible | No disponible | Propietaria, sin licencia concedida | Repositorio Hugging Face con documentación y código; sin pesos |
| No disponible | No disponible | No disponible | No disponible | No disponible |

No se identifican modelos comparables en la información proporcionada. TOM-GROK no es un modelo de lenguaje con pesos publicados, por lo que la comparación con alternativas de la misma categoría (LLM open source) no es aplicable.

## Limitaciones y advertencias

- No contiene pesos de modelo ni pipeline de inferencia en el sentido convencional; no puede ejecutarse como un LLM.
- La licencia es propietaria y no concede ningún derecho de uso, copia, modificación, distribución, comercialización ni entrenamiento; el uso comercial está expresamente prohibido sin autorización del titular.
- El autor declara el artefacto como propiedad personal (Tom Klootwijk, NL200678942), con una notificación de reserva de derechos que no constituye una concesión de licencia.
- No hay benchmarks, métricas de rendimiento ni evaluaciones independientes publicadas.
- El único idioma declarado es el inglés.
- Riesgo de alucinación: no evaluable, al no existir un modelo generativo con pesos.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto: no disponibles.
- La documentación incluye afirmaciones matemáticas y de aplicación (física, robótica, cuántica) sin revisión formal declarada por el propio autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.

## Enlaces

- [Hugging Face: c0mbatduckzz/TOM-GROK](https://huggingface.co/c0mbatduckzz/TOM-GROK)
- [Compendio matemático (159 páginas)](compendium/TOM_SROK_ALLUNEEDIUM_Interdisciplinary_Mathematical_Compendium.pdf)
- [Catálogo de dominios legible por máquina](compendium/TK_SROF_ATLAS_domain_catalogue.json)
- [Manifiesto de fuentes matemáticas](ATLAS_SOURCE_MANIFEST.json)
- [Compendio de control físico (77 páginas)](compendium/TK_SROK_Physical_Control_Compendium.pdf)
- [Formalización original (29 páginas)](formalization/Tom_Klootwijk_Optimized_Formalization.pdf)
- [Guía del kernel](kernel/README.md)
- [Código fuente CUDA](kernel/native/kernel.cu)
- [ABI del kernel](kernel/docs/ABI.md)
- [Export de Google (24 páginas)](sources/subbyStraight/that-hunting-buddy-of-jimbo-south-park-vocoder.pdf)
- [Conversación sobre antena (2 páginas)](sources/subbyStraight/antenna-charge-transfer-conversation.pdf)
- [Manifiesto de fuentes del compendio](COMPENDIUM_SOURCE_MANIFEST.json)
- [Manifiesto de release](RELEASE.json)
- [Notificación de propiedad](PROPRIETARY_NOTICE.txt)
- [Autor](AUTHOR.json)
