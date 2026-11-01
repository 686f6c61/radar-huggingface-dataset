# BioJazz-Lab/bioemu2

## Resumen
BioEmu-2 es un modelo de investigación desarrollado por Microsoft Research que genera conjuntos (ensembles) de estructuras tridimensionales plausibles de biomoléculas a nivel de todos los átomos (all-atom) a partir de su composición química. A diferencia de los modelos de plegamiento clásicos que devuelven una única estructura, BioEmu-2 muestrea múltiples conformaciones mediante difusión inversa, lo que permite estudiar dinámica conformacional, movimientos e interacciones de biomoléculas. El modelo admite complejos multicadena, ligandos y ácidos nucleicos, y puede guiarse opcionalmente con información de distancias entre átomos concretos.

La arquitectura es un modelo de puntuación (score model) all-atom basado en difusión, con aproximadamente 500 millones de parámetros. Los pesos se publican bajo licencia MIT, con código de inferencia de código abierto (API Python e interfaz de línea de comandos) disponible en el repositorio oficial de GitHub. El entrenamiento se realizó entre agosto y septiembre de 2026, con publicación en octubre de 2026.

Es relevante porque aborda una tarea distinta del plegamiento estático: la emulación de dinámica molecular y el muestreo de estados conformacionales, evaluándose tanto en benchmarks públicos de predicción de estructura como en suites de emulación de MD y en capacidad de escalado a complejos grandes. El modelo está orientado exclusivamente a investigación y sus salidas deben tratarse como hipótesis computacionales, no como medidas experimentales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de puntuación all-atom basado en difusión (diffusion-based all-atom score model) |
| Parametros totales | Aproximadamente 500M |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (evaluado en complejos de más de 1.500 tokens; limitación reportada por encima de 10k tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | No disponible (repo de 2,0 GB en HuggingFace) |

## Arquitectura y entrenamiento
BioEmu-2 emplea un modelo de puntuación all-atom de difusión que genera coordenadas cartesianas de todos los átomos mediante muestreo por difusión inversa. Las entradas son la secuencia o secuencias biomoleculares más un alineamiento múltiple de secuencias (MSA) opcional, condicionamiento por contactos y condicionamiento por método. Las salidas son un ensemble generativo de estructuras 3D en coordenadas cartesianas. La predicción puede guiarse opcionalmente mediante distancias entre átomos específicos proporcionadas por el usuario.

Los datos de entrenamiento provienen de PDB, AFDB y datos de dinámica molecular generados por Microsoft, según la sección de limitaciones de la model card. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset, ni si se aplicaron etapas de RLHF o DPO (poco plausibles en un modelo biológico estructurall). La innovación central es el muestreo multiconformacional y la emulación de MD, evaluada mediante cobertura de estados y divergencias de distribución de pesos sobre un conjunto de retención. El mismo checkpoint se usa para evaluar todos los benchmarks.

## Capacidades
- Predicción de estructuras 3D de biomoléculas a nivel all-atom a partir de la composición química.
- Generación de ensembles de múltiples conformaciones en lugar de una única estructura estática.
- Modelado de complejos multicadena, ligandos unidos y ácidos nucleicos.
- Condicionamiento opcional por distancias entre átomos concretos para guiar la estructura.
- Entrada opcional de MSA, condicionamiento por contactos y condicionamiento por método.
- Emulación de dinámica molecular mediante muestreo de estados conformacionales.
- Escalado a complejos grandes (evaluado en subconjuntos de más de 1.500 tokens).
- API Python e interfaz de línea de comandos para integración en pipelines.
- No genera secuencias ni predice afinidades de unión.

## Casos de uso
- Estudio de dinámica conformacional de proteínas: el modelo genera ensembles de conformaciones plausibles que permiten analizar movimientos e interacciones de biomoléculas, superando la limitación de una estructura única de los modelos de plegamiento.
- Emulación de dinámica molecular: investigadores pueden usar las muestras del modelo como sustituto computacional de simulaciones MD costosas, evaluando cobertura de estados y divergencias de distribución antes de validar experimentalmente.
- Predicción de estructuras de complejos proteína-ligando: admite ligandos unidos y complejos multicadena, útil en estudios de reconocimiento molecular y análisis de interfaces mediante puntuaciones DockQ.
- Modelado de ácidos nucleicos y complejos mixtos: soporta cadenas de ácido nucleico junto con proteínas, adecuado para sistemas biológicos que combinan polímeros distintos.
- Guiado por restricciones experimentales: el condicionamiento por distancias entre átomos permite incorporar información de cross-linking, FRET u otros datos experimentales para refinar el muestreo conformacional.
- Análisis de efectos de parejas de plegamiento: el benchmark interno contrasta estructuras PDB altamente similares emparejadas para evaluar la capacidad de distinguir estados conformacionales según el sistema de entrada.
- Investigación en proteínas huérfanas y construcciones de ingeniería: con MSAs profundos, el modelo puede aplicarse a familias menos estudiadas, aunque con calidad degradada documentada.

## Benchmarks y rendimiento
No se han publicado resultados numéricos de benchmarks en la información disponible. La model card describe la metodología de evaluación (RMSD, TM-score, lDDT, fisicalidad e interface DockQ sobre el conjunto de test de Boltz-1; benchmark interno multiconformacional; suite de emulación MD; escalado a complejos de más de 1.500 tokens), pero no incluye los valores concretos de estas métricas.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo tiene aproximadamente 500M parámetros.
- GPU recomendadas: NVIDIA; la GPU más pequeña probada es una A100 de 80 GB.
- Compatibilidad con GPU de consumo: no confirmada; la A100 de 80 GB es el dispositivo mínimo testeado, por lo que no se garantiza su funcionamiento en GPUs consumer.
- Opciones de despliegue: código de inferencia de código abierto con API Python e interfaz de línea de comandos (repositorio de GitHub); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La model card menciona comparaciones con modelos de cofolding de última generación y el conjunto de test de Boltz-1, pero no se proporcionan nombres, parámetros, contextos ni resultados de esos modelos comparables en la información disponible.

## Limitaciones y advertencias
- Las salidas son hipótesis plausibles, no medidas experimentales, y no deben tratarse como datos validados.
- Dependencia del MSA: la calidad se degrada con MSAs poco profundos o pobres, incluidas proteínas huérfanas, construcciones de ingeniería y algunas proteínas virales.
- Sesgo de distribución de entrenamiento: PDB, AFDB y datos MD generados por Microsoft sobrerrepresentan familias proteicas bien estudiadas; el rendimiento en clases de secuencia infrarrepresentadas es incierto.
- Ensembles no calibrados: la frecuencia de muestreo no debe interpretarse como probabilidad de Boltzmann calibrada ni como energía libre cuantitativa.
- Alcance de ligandos: se admiten ligandos unidos proporcionados, pero el diseño de novo de ligandos y la predicción de afinidad de unión están fuera de alcance.
- Fisicalidad en sistemas grandes: el modelo puede tener dificultades para producir estructuras físicamente plausibles en complejos extremadamente grandes (más de 10k tokens).
- No genera secuencias ni predice afinidades de unión.
- Uso clínico, diagnóstico, terapéutico o de dosificación no validado; tampoco para diseño de toxinas, patógenos o constructos de ganancia de función, ni para decisiones autónomas de alto riesgo.
- Liberado para fines de investigación; no se recomienda su uso comercial o en aplicaciones reales sin pruebas y desarrollo adicionales.
- Combinado con herramientas de generación de secuencias o diseño autónomo puede crear riesgos no evaluados para el modelo por separado.
- Sujeto a la ley aplicable, controles de exportación y la Política de Uso Aceptable de Microsoft.

## Enlaces
- HuggingFace (modelo): https://huggingface.co/BioJazz-Lab/bioemu2
- HuggingFace (checkpoints oficiales): https://huggingface.co/microsoft/bioemu2
- Repositorio de código fuente: https://github.com/microsoft/bioemu2
