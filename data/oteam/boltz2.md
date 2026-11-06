# oteam/boltz2

## Resumen
Boltz-2 es un modelo de predicción de estructura biomolecular a nivel de todos los átomos y de afinidad de unión proteína-ligando. El modelo original fue desarrollado por Saro Passaro, Gabriele Corso, Jeremy Wohlwend y colaboradores (MIT y Recursion), y esta ficha corresponde a `oteam/boltz2`, una implementación no oficial distribuida por el equipo OFoldX dentro de su librería `ofoldx`. Resuelve dos problemas clásicos del descubrimiento de fármacos: predecir la conformación tridimensional de complejos proteína-ligando, ARN y ADN, y estimar la afinidad de unión de forma computacionalmente eficiente.

La arquitectura combina atención atómica, codificadores de plantillas y de alineamiento múltiple de secuencias (MSA), un tronco Pairformer con reciclado y difusión de coordenadas EDM. La variante de estructura tiene 506,76 millones de parámetros; la variante de afinidad, 515,09 millones. El contexto no es una ventana de tokens al uso, sino el conjunto de secuencias, MSA y plantillas que definen el complejo de entrada.

Su relevancia actual radica en que acerca la predicción de afinidad al régimen de segundos o minutos por complejo, lo que habilita cribados virtuales a gran escala sin recurrir a docking clásico ni a simulaciones de dinámica molecular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pairformer con atención atómica, codificadores de plantillas y MSA, tronco reciclado y difusión de coordenadas EDM; cabezas de afinidad por pares en la variante de scoring |
| Parametros totales | 506.762.496 (variante de estructura); 515.088.000 aprox. (variante de afinidad) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; la entrada es un complejo molecular con MSA y plantillas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
Boltz-2 es un predictor de estructura alostérico de todos los átomos construido sobre un tronco Pairformer con 64 bloques, 2 bloques de plantilla, 8 bloques de confianza y 4 pasadas de reciclado. La dimensión single es 384 y la pair es 128. La generación de coordenadas se realiza mediante difusión EDM, y la variante de afinidad añade 8 + 4 bloques específicos con 6 pasadas de tronco. El flujo de afinidad es en dos etapas: primero predice y clasifica estructuras, después remuestrea y puntúa el complejo seleccionado.

El entrenamiento descrito en el informe original usa estructuras del PDB anteriores al 1 de junio de 2023, datos de RMN, trayectorias de dinámica molecular, destilación de monómeros de AlphaFold 2 y destilación de complejos de Boltz-1. Los datos de afinidad provienen de PubChem, ChEMBL, BindingDB y fuentes de ensayo filtradas, con generación de señuelos y filtrado por confianza estructural. La implementación de OFoldX expone el objetivo de denoising de coordenadas, pero no reproduce el entrenamiento por etapas de confianza y afinidad ni los pipelines de datos y generación de señuelos.

## Capacidades
- Predicción de estructura tridimensional de complejos proteína-ligando, ARN y ADN a nivel de todos los átomos.
- Predicción de confianza estructural asociada a cada residuo y complejo.
- Predicción de afinidad de unión proteína-ligando mediante una variante específica (`oteam/boltz2-affinity`).
- Clasificación binaria de ligando como binder o no binder mediante objetivo focal.
- Guiado físico durante el muestreo con potenciales geométricos y de van der Waals, sujeto a números atómicos y radios tabulados soportados.
- Soporte de selección de posiciones diseñadas para confianza orientada a diseño.
- No soporta tool calling, agentes ni capacidades lingüísticas: no es un modelo de lenguaje.

## Casos de uso
- Cribado virtual de compuestos: dado un conjunto de ligandos candidatos y la estructura de la diana, la variante de afinidad puntúa cada complejo y permite priorizar los de mayor afinidad predicha antes de ensayos húmedos.
- Reposicionamiento de fármacos: se evalúan moléculas ya aprobadas frente a dianas nuevas para detectar uniones plausibles sin partir de cero.
- Predicción de estructura de complejos proteína-ARN o proteína-ADN: útil en biología estructural para generar hipótesis de interacción en sistemas con MSA disponible.
- Guiado de diseño de proteínas: la selección de posiciones diseñadas permite obtener confianza específica sobre las regiones modificadas y descartar diseños inestables.
- Filtrado previo a cristalografía o criomicroscopía: se generan modelos iniciales de complejos para fases de biología estructural, reduciendo el número de constructos a probar.
- Análisis de selectividad: comparar la afinidad predicha de un mismo ligando frente a una familia de dianas relacionadas para estimar riesgo de off-target.
- Docencia e investigación metodológica: la implementación de OFoldX permite reproducir el pipeline de plegado y scoring en entornos académicos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,0 GB en safetensors, lo que sugiere que el modelo en precisión nativa cabe en GPUs de 16 GB o más, aunque el consumo real depende del tamaño del complejo, la profundidad del MSA y el número de muestras de difusión.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo y el uso de difusión con múltiples pasadas, se espera que GPUs de datacenter (A100, H100) sean las adecuadas para cribados a gran escala.
- GPU de consumo: probablemente ejecutable en RTX 4090 y tarjetas con 24 GB, aunque no hay cifras oficiales.
- Opciones de despliegue: la librería `ofoldx` (pip install ofoldx) con pipelines `fold` y `score`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Afinidad proteina-ligando | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boltz-2 (esta ficha) | 506,76 M (estructura) / 515,09 M (afinidad) | no aplica | Sí, en dos etapas | AGPL-3.0 | Hugging Face (oteam/boltz2) |
| AlphaFold 3 | no disponible | no aplica | Parcial (no enfocado a afinidad) | no disponible | Acceso restringido vía servidor |
| Boltz-1 | no disponible | no aplica | No | MIT (según repositorio original) | Código y pesos públicos |
| Chai-1 | no disponible | no aplica | No | no disponible | Pesos públicos para uso no comercial |

## Limitaciones y advertencias
- Implementación no oficial: la model card fue escrita por el equipo OFoldX, no por los autores originales de Boltz-2.
- OFoldX no reproduce el entrenamiento por etapas de confianza y afinidad ni los pipelines de datos y generación de señuelos del modelo original, por lo que el comportamiento puede diferir del oficial.
- Los potenciales físicos de guiado requieren números atómicos conocidos y radios tabulados soportados; elementos no soportados provocan errores.
- La distribución de elementos suave no determina un radio único; los potenciales guían el muestreo pero no establecen identidad ni validez química.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código que integre el modelo, lo que puede ser incompatible con productos propietarios.
- Riesgo de alucinación estructural: el modelo puede generar conformaciones plausibles pero incorrectas, especialmente en complejos grandes o con MSA escaso.
- No redistribuye los datasets de entrenamiento (PDB, PubChem, ChEMBL, BindingDB), lo que limita la reproducibilidad completa.
- No es un modelo lingüístico: no admite prompts en lenguaje natural, tool calling ni razonamiento multi-paso genérico.
- Sesgos hacia dianas y ligandos sobrerrepresentados en PDB y ChEMBL; el rendimiento en quimiotipos novedosos no está caracterizado en la información disponible.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/oteam/boltz2
- Variante de afinidad: https://huggingface.co/oteam/boltz2-affinity
- Código OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/boltz2
- Documentación de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Repositorio oficial de Boltz-2: https://github.com/jwohlwend/boltz
- Paper: https://doi.org/10.1101/2025.06.14.659707
- Sitio de OFoldX: https://ofoldx.valtech.ai/
