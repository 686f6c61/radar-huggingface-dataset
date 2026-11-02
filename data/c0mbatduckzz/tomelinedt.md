# c0mbatduckzz/TOMElinedT

## Resumen

TOMElinedT es un proyecto de agente de borde determinista desarrollado por Tom Klootwijk (usuario de HuggingFace c0mbatduckzz), gobernado por la especificación XD-TAU AURUMTOMATON v1.5.1. No es un modelo de lenguaje en el sentido convencional: la propia model card declara explícitamente que "no hay razonamiento LLM ni runtime de generación de texto". Se trata de un conjunto de estructuras computacionales y operadores simbólicos, con semántica exacta de enteros, racionales, simbólica y de bits, empaquetado junto a una aplicación Android de desarrollo.

El objetivo arquitectónico declarado es un agente determinista, polimórfico y automórfico basado en LUT (tablas de consulta), donde la flexibilidad proviene de componer estructuras bajo sus invariantes declarados y mapas inversos. El repositorio incluye un APK experimental de Android (versión 0.17.0), el paquete de código fuente correspondiente y un checkpoint de desarrollo v0.18 con componentes verificados e integración inacabada.

La relevancia de este artefacto es limitada para el público general de modelos de IA: se trata de un proyecto personal de investigación en fase temprana, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni licencia que permita su uso. Su interés es fundamentalmente documental para quienes estudien enfoques de computación simbólica determinista en el borde, no como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente determinista basado en LUT con composición estructural simbólica; no es un transformer ni un LLM |
| Parametros totales | No disponible (no aplica: no es un modelo neuronal con pesos entrenados) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Propietaria, sin concesión de licencia ("proprietary, no-license-granted") |
| Formato de pesos | No disponible; el repositorio contiene APK Android, paquete de código fuente (ZIP) y checkpoint de código fuente con recursos de modelo vinculados |

## Arquitectura y entrenamiento

La arquitectura no sigue el paradigma de transformers ni de modelos de mezcla de expertos. Según la model card, se trata de un agente determinista, polimórfico y automórfico basado en LUT, donde el conocimiento y el comportamiento se definen mediante código fuente y estructuras declaradas. El proyecto se organiza en torno a varios componentes nombrados: XD-TAU AURUMTOMATON v1.5.1 (especificación de 87 páginas), TNO/TNOMTOM y TOMK, que proporcionan composición definida por fuente, ejecución, propiedad y admisión. Las operaciones retienen semántica exacta de enteros, racionales, simbólicos y de bits, con un ámbito separado para la aritmética de plataforma y visualización de Android.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO, porque el proyecto no entrena un modelo neuronal. Entre las innovaciones técnicas declaradas figuran la composición estructural bajo invariantes, los mapas inversos, las definiciones log-polar/LUT, PCG/L-system, CSG/ECS/ERD y Fresnel, y un espacio de trabajo de codificación con 28 perfiles fijados que construye candidatos, ejecuta comprobaciones declaradas, retiene contraejemplos y decide la admisión. El checkpoint v0.18 incluye trabajo en curso sobre el runtime "Owner5/full30", que no está activado.

## Capacidades

- Espacio de trabajo de codificación: construcción de candidatos a partir de programas fuente reales, ejecución de comprobaciones declaradas, retención de contraejemplos, revisiones explícitas y decisión de admisión; las operaciones están acotadas y definidas por fuente.
- Autocorrección personal y cronología de edición: pares literales confirmados, cronología de edición y cursor, gestión de ambigüedad, revisión, pausa/reanudación y controles de borrado de datos y claves; incluye almacenamiento cifrado y cuatro tipos de modelo personal cerrados (TABLE27, SCALAR_EDIT31, SCALAR_QUOTIENT y SCALAR_CONSTRAINT31).
- Herramientas de patrones, Finder y Constraints: construcción y verificación de composiciones fuente acotadas, preservación de expresiones originales y alternativas sintácticas, retención de testigos y contraejemplos reales.
- Inspección de conocimiento y fuentes: recuperación de paquetes locales y API de spans de Wikipedia en bruto que preservan bytes originales y procedencia.
- Composición estructural y desarrollo nativo: suite de modelos con identidades fuente, lecturas tipadas, historiales, estados OLD, presupuestos y contadores de ejecución.
- No soporta generación de texto, razonamiento LLM, tool calling, function calling, agentes multi-paso basados en lenguaje natural, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Investigación en computación simbólica determinista: el proyecto sirve como referencia documental de una implementación de agente de borde con semántica exacta de enteros y racionales, útil para estudiar alternativas a los LLM en tareas donde la reproducibilidad exacta es requisito.
- Autocorrección de texto en dispositivo: la aplicación Android incluye un sistema de autocorrección personal que registra pares confirmados y cronología de edición, con almacenamiento cifrado, adecuado para escenarios de privacidad estricta donde los datos no deben salir del dispositivo.
- Verificación de composiciones acotadas: las herramientas Patterns, Finder y Constraints permiten construir y verificar composiciones fuente con testigos y contraejemplos, aplicable a validación formal de transformaciones en pipelines de código.
- Inspección de procedencia documental: la API de spans de Wikipedia en bruto, que preserva bytes originales, puede usarse en flujos de auditoría de fuentes y correlación de referencias.
- Desarrollo nativo Android con JNI: el APK 0.17.0 incluye 139 exportaciones JNI dirigidas a API35 con mínimo API26, lo que lo hace útil como base de experimentación en integración de código nativo en Android.
- Estudio de arquitecturas LUT y log-polar: las definiciones Fresnel, log-polar/LUT y PCG/L-system del checkpoint v0.18 pueden servir como material de referencia para investigadores que exploren representaciones simbólicas con coordenadas de longitud de onda inversa.
- Evaluación de metodología de checkpoints: el proyecto documenta estados de validación, checksums SHA256 y separación entre observaciones de entrenamiento, validación y holdout, lo que puede interesar a quienes diseñen procesos de verificación de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta evidencia de desarrollo: pruebas nativas de nueve familias en caliente/frío, cinco fases de sesión acotadas superadas, cinco de nueve familias que pasaron la comparación en caliente con el modelo Original, seis pruebas de publicación de transporte Windows superadas, once unidades fuente compiladas para Android ARM64/API26 y un arnés de compilación aislada de 157 unidades preparado pero no ejecutado en su totalidad.

## Requisitos de hardware

- El APK 0.17.0 ocupa 47.920.733 bytes y está dirigido a Android API35 con mínimo API26; se ejecuta en dispositivos Android ARM64.
- La evidencia física de ejecución más reciente corresponde a un dispositivo POCO con GPU Mali, pero data de la versión 0.8, no de la 0.17.
- No se dispone de estimaciones de VRAM para inferencia porque no hay un modelo neuronal que cargar; el proyecto se distribuye como aplicación Android y código fuente.
- No se dispone de datos de latencia ni throughput.
- Opciones de despliegue: instalación del APK en Android ARM64 o compilación del código fuente con las herramientas nativas declaradas (arnés de compilación aislada de 157 unidades, aún no ejecutado por completo). No se contemplan vLLM, llama.cpp, Ollama ni TGI, al no existir runtime de generación de texto.

## Comparativa con modelos similares

No disponible. TOMElinedT no es un modelo de lenguaje y no existen alternativas directamente comparables en la misma categoría dentro del ecosistema habitual de HuggingFace; los proyectos de computación simbólica determinista en el borde no se distribuyen con las mismas métricas (parámetros, contexto, benchmarks) que los LLM.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona; cualquier expectativa de uso como LLM es incorrecta.
- Licencia propietaria sin concesión: la etiqueta "no-license-granted" implica que no se concede permiso de uso, modificación ni redistribución; el uso comercial está prohibido por defecto.
- Proyecto personal en fase temprana: cero descargas y cero likes en el momento de la consulta, con evidencia de validación parcial y componentes sin integrar.
- El checkpoint v0.18 es código fuente de desarrollo con integración inacabada; no incluye APK nuevo ni activa el runtime Owner5/full30.
- La evidencia de ejecución física más reciente (POCO/Mali) corresponde a la versión 0.8, no a la 0.17.
- El corpus de Wikipedia no está incluido en el APK ni en el checkpoint; debe adquirirse por separado.
- La integración completa de catálogo e índice de títulos y la correlación semántica general están sin terminar; el indexador detenido permanece detenido.
- El PDF de objetivo arquitectónico es una instantánea de evidencia anterior; el estado de validación más reciente está en STATUS.json.
- Las claves de firma, historiales de entrada personales, cadenas de herramientas y corpus externos quedan fuera de la instantánea de código fuente.
- Riesgo de alucinación: no aplica en el sentido habitual, pero las predicciones para entradas no vistas se presentan como sugerencias que requieren confirmación manual explícita.
- Idioma limitado al inglés.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/c0mbatduckzz/TOMElinedT
- Especificación XD-TAU AURUMTOMATON v1.5.1: https://huggingface.co/c0mbatduckzz/XD-TAU_AURUMTOMATON_v1.5.1
- APK Android 0.17.0: TOMElinedT_arm64_debug.apk (referenciado en la model card)
- Paquete de código fuente 0.17: TOMElinedT_Source.zip (referenciado en la model card)
- Checkpoint v0.18: checkpoints/v0.18-2026-11-02/TOMElinedT_v0_18_WIP_Source_and_Bound_Model_Resources.zip
- Estado del checkpoint: checkpoints/v0.18-2026-11-02/STATUS.json
- PDF de objetivo arquitectónico v0.18: checkpoints/v0.18-2026-11-02/TOMElinedT_Architectural_Goal_v0_18_Working.pdf
- Checksums: SHA256SUMS
