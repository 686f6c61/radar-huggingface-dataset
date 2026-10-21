# microsoft/bioemu2

## Resumen

BioEmu-2 es un modelo de investigación desarrollado por Microsoft Research que genera conjuntos (ensembles) de estructuras tridimensionales plausibles con todos los átomos de biomoléculas a partir de su composición química. A diferencia de los modelos de plegamiento clásicos, que devuelven una única estructura, BioEmu-2 muestrea múltiples conformaciones mediante difusión inversa, lo que permite estudiar cómo se mueven e interaccionan las biomoléculas. Soporta complejos multicadena, ligandos unidos y ácidos nucleicos.

El modelo tiene aproximadamente 500 millones de parámetros y se distribuye con licencia MIT, junto con código de inferencia de código abierto (API de Python e interfaz de línea de comandos). Se entrenó entre agosto y septiembre de 2026 y se publicó en octubre de 2026. Su relevancia actual radica en que cubre dos tareas que los modelos de plegamiento no abordan de forma nativa: la generación de diversidad conformacional y la emulación de dinámica molecular, con la posibilidad adicional de condicionar el muestreo mediante distancias entre átomos concretos.

Es importante encuadrarlo correctamente: no es un modelo de lenguaje ni un modelo generativo de secuencias. Consume secuencias biomoleculares (con un alineamiento múltiple de secuencias opcional) y produce coordenadas cartesianas. Microsoft lo publica para uso en investigación y advierte explícitamente de que no está validado para aplicaciones comerciales o clínicas sin desarrollo y evaluación adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de score atomístico completo basado en difusión (*diffusion-based all-atom score model*); muestreo por difusión inversa |
| Parámetros totales | Aproximadamente 500M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; la entrada es una o varias secuencias biomoleculares con MSA opcional. El rendimiento puede degradarse en complejos extremadamente grandes (más de 10k tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (la entrada son secuencias biomoleculares, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | No disponible (checkpoints publicados en HuggingFace; el repositorio ocupa 2,0 GB) |

Otros datos de la ficha del autor: entradas consistentes en secuencia(s) más MSA opcional, condicionamiento por contactos y condicionamiento por método; salidas en coordenadas cartesianas 3D; desarrollador Microsoft Research; fechas de entrenamiento agosto–septiembre de 2026; publicación en octubre de 2026. En HuggingFace acumula 14 *likes* y 0 descargas en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es un modelo de score de difusión que opera sobre representaciones atomísticas completas. El proceso generativo parte de ruido y aplica difusión inversa para producir coordenadas cartesianas de todos los átomos del sistema, lo que da lugar a un ensemble de estructuras en lugar de una predicción única. El modelo se puede condicionar con un alineamiento múltiple de secuencias (MSA) opcional, con información de contactos y con un condicionamiento de método, y admite la guía del muestreo mediante distancias especificadas por el usuario entre pares de átomos concretos.

Según la model card, los datos de entrenamiento combinan estructuras del PDB, de AFDB (AlphaFold Database) y datos de dinámica molecular generados por Microsoft. La evaluación publicada cubre tres frentes: predicción de estructura con benchmarks públicos estándar (métricas RMSD, TM-score, lDDT, fisicalidad e *interface DockQ* sobre el conjunto de test de Boltz-1), muestreo multiconformacional sobre un subconjunto curado de estructuras del PDB altamente similares emparejadas para contrastar el efecto de parejas de co-plegamiento (ligandos de molécula pequeña y otras cadenas poliméricas), y emulación de dinámica molecular sobre un conjunto de retención de los datasets de MD, midiendo cobertura de estados y divergencias de distribución de pesos. También se evalúa la capacidad de escalar a complejos grandes (subconjunto de complejos de más de 1500 tokens). El mismo checkpoint se emplea en todas las evaluaciones. No se detalla en la información disponible si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Generación de ensembles conformacionales de estructuras 3D con todos los átomos a partir de la composición química de la biomolécula.
- Modelado de múltiples conformaciones en lugar de una estructura única, lo que permite estudiar movimiento y flexibilidad.
- Soporte de complejos multicadena.
- Soporte de ligandos unidos (se aceptan ligandos proporcionados por el usuario).
- Soporte de ácidos nucleicos.
- Condicionamiento opcional mediante alineamiento múltiple de secuencias (MSA).
- Condicionamiento opcional por contactos y por método.
- Guiado del muestreo mediante restricciones de distancia entre átomos concretos especificadas por el usuario.
- Emulación de dinámica molecular: evaluación de cobertura de estados y divergencia de distribuciones de pesos frente a datos de MD.
- Escalado a complejos grandes, con limitaciones reconocidas por encima de 10k tokens.
- API de Python e interfaz de línea de comandos para integración en flujos de trabajo.
- No genera secuencias y no predice afinidades de unión.

## Casos de uso

- Exploración de flexibilidad conformacional en dianas terapéuticas: el modelo genera un ensemble de conformaciones plausibles para una proteína dada, lo que permite identificar estados alternativos (por ejemplo, bolsillos crípticos) que una estructura única no revela, antes de abordar un estudio de acoplamiento.
- Predicción de estructuras de complejos proteína-proteína: al soportar multicadena, se puede modelar la interfaz de un complejo y evaluar su plausibilidad con métricas como *interface DockQ*, útil para priorizar experimentos de cristalografía o crio-microscopía electrónica.
- Modelado de complejos proteína-ácido nucleico: el soporte de ácidos nucleicos permite construir hipótesis estructurales de complejos proteína-ADN o proteína-ARN en estudios de transcripción, replicación o empaquetamiento.
- Integración de restricciones experimentales: el condicionamiento por distancias entre átomos permite incorporar datos de entrecruzamiento, FRET u otras medidas de distancia para filtrar o guiar el muestreo y contrastar hipótesis estructurales.
- Sustitución parcial de dinámica molecular larga: la capacidad de emulación de MD evaluada por el autor sugiere su uso para explorar el paisaje conformacional a un coste computacional inferior al de una simulación atomística extensa, tratando siempre los resultados como hipótesis no calibradas.
- Análisis de efectos de co-plegamiento: el benchmark multiconformacional del autor está diseñado para distinguir estados inducidos por la presencia de ligandos u otras cadenas, lo que resulta aplicable a estudios de regulación alostérica y de ensamblaje.
- Generación de conjuntos de datos estructurales para investigación metodológica: los ensembles generados pueden servir como material de partida para desarrollar o validar métodos de análisis conformacional, siempre con validación independiente.
- Docencia y formación en biología estructural computacional: la API de Python y la CLI facilitan reproducir experimentos de muestreo conformacional en entornos académicos con GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card describe la metodología de evaluación, pero el texto proporcionado no incluye las cifras.

| Benchmark / evaluación | Métricas declaradas | Resultados |
|---|---|---|
| Predicción de estructura (conjunto de test de Boltz-1) | RMSD, TM-score, lDDT, fisicalidad, *interface DockQ* | No disponible |
| Muestreo multiconformacional (subconjunto curado del PDB) | Acierto al distinguir y generar los estados designados para cada definición de sistema | No disponible |
| Emulación de MD (conjunto de retención de los datasets de MD) | Cobertura de estados y divergencias de distribución de pesos | No disponible |
| Escalado a complejos grandes (subconjunto >1500 tokens) | Comparación frente a alternativas | No disponible |

## Requisitos de hardware

- GPU probadas: NVIDIA. La unidad más pequeña testeada por el autor es una A100 de 80 GB.
- VRAM estimada para los pesos: alrededor de 2 GB en precisión de 32 bits y alrededor de 1 GB en 16 bits para los ~500M parámetros, aunque el requisito real de inferencia está dominado por el coste del muestreo por difusión y por el tamaño del sistema (número de átomos y de tokens), no solo por los pesos.
- Cabe en GPU de consumo: no disponible como recomendación validada. El autor declara que la A100 de 80 GB es el dispositivo más pequeño probado, por lo que el uso en GPU de consumo no está respaldado por la documentación, aunque los pesos por sí solos quepan en tarjetas de 8–24 GB.
- GPU recomendadas: A100 80 GB (mínimo validado); H100 u otras GPU de datacenter con memoria igual o superior para sistemas grandes.
- Opciones de despliegue: código de inferencia de código abierto con API de Python y CLI desde el repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información disponible no incluye parámetros ni licencias de los modelos alternativos, por lo que la comparación se limita a lo declarado en la model card.

| Modelo | Categoría | Parámetros | Contexto / escala | Enfoque de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BioEmu-2 | Modelo generativo conformacional por difusión | ~500M | Complejos >1500 tokens evaluados; degradación esperada por encima de 10k tokens | Ensemble de estructuras all-atom | MIT | Pesos en HuggingFace y código en GitHub |
| Modelos de co-plegamiento del estado del arte (familia empleada como referencia en el test de Boltz-1) | Co-plegamiento / predicción de estructura | No disponible | No disponible | Estructura única o limitada | No disponible | No disponible |
| Boltz-1 (solo como conjunto de test de referencia) | Predicción de estructura de complejos | No disponible | No disponible | No disponible | No disponible | No disponible |

La diferencia funcional principal frente a los modelos de plegamiento es que BioEmu-2 está diseñado para producir diversidad conformacional y emular MD, no para dar una única estructura de mínima energía. La comparación cuantitativa con esas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Las salidas son hipótesis plausibles, no medidas experimentales; no deben tratarse como mediciones validadas.
- Dependencia del MSA: se espera un deterioro de la calidad con MSAs poco profundos o de baja calidad, incluidos proteínas huérfanas, construcciones de ingeniería y algunas proteínas virales.
- Sesgo hacia la distribución de entrenamiento: los datos de PDB, AFDB y MD generados por Microsoft sobrerrepresentan familias proteicas muy estudiadas; el rendimiento en clases de secuencia poco representadas es incierto.
- Ensembles no calibrados: la frecuencia de muestreo no debe interpretarse como una probabilidad de Boltzmann calibrada ni como una energía libre cuantitativa.
- Alcance de ligandos: se admiten ligandos unidos aportados por el usuario, pero el diseño de novo de moléculas pequeñas y la predicción de afinidad de unión quedan fuera de alcance.
- Fisicalidad en sistemas grandes: el modelo puede tener dificultades para generar estructuras físicamente plausibles en complejos extremadamente grandes (por encima de 10k tokens).
- Uso fuera de alcance declarado: no está validado para decisiones clínicas, diagnósticas, de tratamiento o dosificación; ni para el diseño de toxinas, patógenos, construcciones de ganancia de función u otros agentes biológicos peligrosos; ni para predicción cuantitativa de afinidad de unión o energía libre absoluta; ni para diseño de novo de moléculas pequeñas; ni para toma de decisiones autónoma o de alto riesgo (aplicación de la ley, legal, finanzas, sanidad); ni para usos que infrinjan la ley aplicable, controles de exportación o la Política de Uso Aceptable de Microsoft.
- Licencia: MIT permite uso comercial según los términos de la licencia, pero el autor indica explícitamente que el modelo se publica para investigación y que no recomienda su uso en aplicaciones comerciales o del mundo real sin pruebas y desarrollo adicionales.
- El modelo no genera secuencias y no predice afinidades de unión; cualquier expectativa en ese sentido es un error de uso.
- Combinarlo con herramientas de generación de secuencias o de diseño autónomo puede introducir riesgos no evaluados para el modelo por separado.
- No se han caracterizado cuantitativamente varias de las limitaciones anteriores, según reconoce el propio autor.
- No hay información disponible sobre sesgos demográficos o sociales, al no tratar el modelo datos humanos.
- Los resultados de la búsqueda web realizada no aportan documentación adicional sobre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microsoft/bioemu2
- Código fuente: https://github.com/microsoft/bioemu2
- Checkpoints: https://huggingface.co/microsoft/bioemu2
- Paper, blog o demo: no disponible en la información proporcionada
- Enlaces adicionales: la búsqueda web devolvió únicamente páginas genéricas de Microsoft (microsoft.com, account.microsoft.com, support.microsoft.com), sin documentación técnica relevante sobre BioEmu-2
