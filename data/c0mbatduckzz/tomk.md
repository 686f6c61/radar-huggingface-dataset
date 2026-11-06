# c0mbatduckzz/TOMK

## Resumen

TOMK (TOM World & Query Kernel) 0.6.0 es una implementación de investigación de un aprendiz simbólico finito determinista y su pipeline de publicación, desarrollada por Tom Klootwijk (c0mbatduckzz). No es un modelo de lenguaje neuronal: se trata de un sistema simbólico que evalúa 121 hipótesis literales pertenecientes a cuatro familias exactas contra dieciséis conjuntos de datos suministrados, registrando ambigüedad, contraejemplos, contradicción y evidencia de regresión.

El núcleo del sistema es el TOM Learner 0.2, que opera sobre el runtime TOMAGI 1.0 con un ABI fijo (cabecera de 128 bytes, `State64` de 64 bytes, `Cell48` de 48 bytes y dieciséis opcodes). La búsqueda del aprendiz se ejecuta en tiempo de compilación y el runtime TOMAGI se limita a reproducir la salida compilada, lo que garantiza ejecución determinista y reproducibilidad.

Es relevante en el ámbito de la IA simbólica y la verificación formal por su énfasis en cadenas de autoridad content-addressed, ejecución determinista entre Python y C, y publicación inmutable con bloqueo. La licencia es estrictamente propietaria y no se concede ningún derecho de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aprendiz simbólico finito determinista sobre runtime TOMAGI 1.0 (ABI de 128 bytes de cabecera, `State64`, `Cell48`, 16 opcodes) |
| Parametros totales | no disponible (no es un modelo neuronal; 121 hipótesis candidatas en 4 familias) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Propietaria, todos los derechos reservados, sin licencia concedida |
| Formato de pesos | `.tmg` compilado (32.880 celdas, 1.578.368 bytes); semilla canónica de 244 bytes ASCII |

## Arquitectura y entrenamiento

TOMK no sigue una arquitectura transformer ni MoE. Es un aprendiz simbólico finito que opera sobre cuatro familias exactas de hipótesis: polinomio racional de grado máximo dos (34 candidatos), afín por tramos con un punto de ruptura (21), tabla de transición finita completa (27) y árbol de expresión de profundidad dos (39), sumando 121 candidatos. La decisión de dominio se toma mediante definiciones formales estáticas content-addressed.

El flujo de autoridad parte de una semilla canónica de 244 bytes ASCII (SHA-256 `d1417a3136772c0cf3eddcd4962ce07d42cbf87616f7b5bae09fc652d9b807b5`), pasa por un grafo de dependencias verificado, evaluación formal del aprendiz durante la compilación, generación de bytes canónicos, bajada determinista a `Cell48` con `EMIT`, ejecución equivalente en Python y C, materialización autenticada por replay y publicación inmutable con bloqueo en el mismo host. Las innovaciones destacables incluyen aritmética C definida con `wrap32`, rechazo de palabras reservadas no nulas en la cabecera TOMAGI, límites recursivos de valores formales y bytes canónicos, y un oráculo independiente basado en `fractions.Fraction` que no puede seleccionar ni publicar resultados autoritativos.

## Capacidades

- Evaluación de 121 hipótesis literales en cuatro familias exactas contra 16 conjuntos de datos.
- Registro explícito de ambigüedad, contraejemplos, contradicción y evidencia de regresión.
- Materialización de resultados aceptados o rechazados mediante el runtime TOMAGI.
- Compilación sembrada con codificación canónica de resultados en grafos `Cell48`.
- Ejecución determinista e idéntica en Python y C del programa `.tmg` compilado.
- Autenticación de trazas y almacenamiento inmutable genérico.
- Validación estricta y falsificación independiente mediante oráculo `Fraction`.
- Publicación inmutable con bloqueo de hilos/procesos en el mismo host.
- No soporta tool calling, function calling, agentes, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Verificación formal de especificaciones: el sistema permite comprobar que una definición formal produce resultados reproducibles y content-addressed, adecuado para pipelines de auditoría.
- Investigación en IA simbólica: sirve como banco de pruebas para estudiar ambigüedad y promociones falsas en aprendices finitos con 121 candidatos y 16 conjuntos de datos.
- Reproducibilidad de experimentos: la cadena de autoridad desde la semilla de 244 bytes hasta el HEAD reconstruido permite replicar exactamente cualquier resultado publicado.
- Auditoría de regresiones: las propuestas de supersesión deben pasar casos de regresión de todas las definiciones previas fijadas, útil en control de cambios formales.
- Validación cruzada Python/C: la ejecución equivalente en ambos lenguajes permite detectar discrepancias de implementación en sistemas críticos.
- Publicación inmutable de artefactos: el perfil de publicación con bloqueo y reemplazo atómico es aplicable a almacenes de artefactos verificables.
- Docencia de métodos formales: el conjunto acotado de 121 hipótesis y las familias exactas facilitan la exposición didáctica de aprendizaje simbólico determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta el resultado canónico del aprendiz:

| Metrica | Valor |
|---|---|
| Familias | 4 |
| Candidatos | 121 |
| Conjuntos de datos | 16 |
| Aceptados | 9 |
| Rechazados | 7 |
| Ambiguedades | 3 |
| Promociones falsas | 0 |

Artefactos de la cadena del aprendiz: programa formal con SHA-256 `a07d27c1fe88b75b56f19d1e623a170da6ee3271c3638836f7badf079ec170c3`; `.tmg` compilado de 32.880 celdas y 1.578.368 bytes con SHA-256 `5feac19609ed9577688990e1e5adeb7caa81c05d9e26da559ec93be45899c3cf`; resultado materializado de 131.517 bytes con SHA-256 `4e59666a7ccdc2505d94fe760f5d317f5302f8766a6bd8f1b022912890e5844a`.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no es un modelo neuronal).
- GPU recomendadas: no aplicable; el runtime TOMAGI es una implementación en Python y C sin requisitos de aceleración gráfica documentados.
- Cabe en GPU consumer: no aplicable.
- Opciones de despliegue: ejecución del runtime TOMAGI incluido en el repositorio (Python y C); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El tamaño del repositorio es de 0,2 GB y el artefacto compilado ocupa 1.578.368 bytes.

## Comparativa con modelos similares

No disponible. TOMK no es un modelo de lenguaje y no se han identificado en la información proporcionada alternativas comparables de aprendizaje simbólico finito determinista con cadena de autoridad content-addressed.

## Limitaciones y advertencias

- Licencia estrictamente propietaria: no se concede ningún derecho expreso ni implícito de uso, copia, modificación, distribución, sublicencia, comercialización, entrenamiento de modelos ni creación de conjuntos de datos.
- El propietario declara los materiales como propiedad personal (Tom Klootwijk, NL200678942, 10-07-1990); los identificadores son atribución suministrada y no verificada independientemente.
- El sistema solo soporta inglés según los metadatos del repositorio.
- El alcance es muy acotado: 121 hipótesis en 4 familias y 16 conjuntos de datos; no es un modelo de propósito general.
- No dispone de capacidades de generación de texto libre, razonamiento neuronal, código, matemáticas generales, visión, audio ni tool calling.
- Riesgo de alucinación: no aplicable en el sentido habitual, pero el sistema registra explícitamente ambigüedades (3 en el resultado canónico) que provocan rechazo en lugar de selección oculta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción externa.
- La fecha de creación registrada (2026-10-02) es posterior a la fecha actual, lo que conviene verificar antes de cualquier uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/c0mbatduckzz/TOMK
- Especificación del aprendiz: spec/TOM_LEARNER_0_2_WORLD_QUERY_KERNEL_0_6.md
- Especificación de compilación sembrada: spec/TOM_SEEDED_COMPILATION_1_0.md
- Especificación del lenguaje formal: spec/TOM_FORMAL_LANGUAGE_1_0.md
- Semilla autoritativa: TOM_seed_genome_2026-09-01.txt
- Aviso de propiedad: PROPRIETARY_NOTICE.txt
- Atribución: NOTICE.md
