# drmylesgarveylabs/ion_neural_network

## Resumen

El modelo `ion_neural_network` es un prototipo de investigación desarrollado por Dr. Myles Douglas Garvey (investigador independiente) bajo el nombre de NIRGEN (Neurotransmitter Ion Receptor Glial Endocannabinoid Network). Se trata de una red neuronal iónica (INN, por sus siglas en inglés) que abandona la abstracción clásica de voltaje continuo (`y = σ(Wx + b)`) para computar mediante recuentos discretos de partículas, conductancias específicas de iones, estequiometría de receptores y retroalimentación local. El autor sostiene que una única unidad NIRGEN resuelve el problema de paridad XOR no linealmente separable sin capa oculta, algo imposible dentro del paradigma conexionista estándar.

El modelo es relevante porque plantea una crítica fundamental a 80 años de dogma conexionista y propone una alternativa biofísicamente fundamentada. Sin embargo, se encuentra en una fase experimental temprana: no se publican resultados de benchmarks estándar, no hay licencia declarada, ni especificaciones de despliegue. Su valor actual es principalmente conceptual y de investigación, no práctico para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal iónica (INN) NIRGEN: modelo de un solo ion, un solo receptor, una sola vesícula y una sola neurona con subdominios topológicos (hendidura extracelular, membrana anular, citosol intracelular) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa parches de entrada discretos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

NIRGEN modela una única especie iónica (`ion_1`) particionada en tres dominios topológicos acotados: la hendidura extracelular (`B_ecto`), la membrana anular (`B`) y el citosol intracelular (`B_endo`). La entrada se aplica a parches de entrada (`l_i`) que activan receptores con un umbral estequiométrico (`r_l_i`); la translocación de iones ocurre mediante un puente de difusión, y la salida se produce por fusión de vesículas (`V_l_o`) que liberan un cuanto de vuelta a la hendidura. Los únicos parámetros entrenables son los inventarios físicos de receptores (`r_l_i`) y los pools de vesículas listas para liberación (`V_l_o`). Se mantiene un invariante de conservación: `S_B_ecto + S_B_endo = D ≤ C_B_endo + C_B_ecto` en todos los pasos discretos `τ`.

El entrenamiento utiliza estimadores de paso recto (STE) y aproximaciones suaves de suelo mediante series de Fourier para manejar las discontinuidades discretas, optimizando con Adam. Los experimentos incluyen barridos de escala geométrica (diámetros de soma de 10 a 25 µm, perfiles de hendidura de 10 a 40 nm), asignación de presupuesto local, ablaciones de dureza de activación y una variante "impostora continua" que reemplaza los límites discretos por proyecciones reales sin restricciones para medir la degradación del rendimiento.

## Capacidades

- Resolución del problema de paridad XOR de n bits mediante saturación de compartimentos, sin necesidad de capa oculta.
- Conservación exacta de masa en cada paso temporal (invariante de conservación).
- Computación basada en recuentos discretos de partículas, no en activaciones continuas.
- Capacidad de romper la monotonicidad de forma natural gracias a los límites de capacidad de los compartimentos.
- Retroalimentación local (endocannabinoide) modelada explícitamente.
- No es un modelo de lenguaje: no genera texto, no razona sobre código, no soporta tool calling ni agentes.

## Casos de uso

- Investigación en neurociencia computacional: sirve como plataforma para estudiar cómo los sistemas biológicos reales computan con restricciones físicas, en contraste con los modelos artificiales estándar.
- Validación de principios biofísicos: permite probar hipótesis sobre estequiometría de receptores, dinámica de vesículas y conservación de iones en un entorno simulado.
- Educación y divulgación: puede utilizarse como demostración de que la abstracción de voltaje no es la única forma de implementar redes neuronales, y de cómo las restricciones físicas pueden dar lugar a comportamientos emergentes.
- Exploración de alternativas al backpropagation clásico: al entrenar solo inventarios de receptores y pools de vesículas, ofrece un caso de estudio sobre optimización con parámetros discretos y restricciones de conservación.
- Análisis de robustez ante perturbaciones geométricas: los experimentos de barrido de escala permiten estudiar la sensibilidad del cómputo a variaciones en diámetros celulares y grosores de hendidura.
- Comparación con redes continuas: la variante "impostora continua" permite cuantificar la pérdida de rendimiento al abandonar los límites físicos, lo que puede informar el diseño de arquitecturas híbridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona tres paradigmas de evaluación (paridad XOR de n bits, tasa de convergencia estequiométrica y error de invariancia de masa), pero no se proporcionan cifras numéricas ni comparaciones con otros modelos.

## Requisitos de hardware

No disponible. El tamaño del repositorio es de 0.6 GB, pero no se especifican requisitos de VRAM, GPU recomendadas, ni opciones de despliegue. Al ser un modelo de investigación con parámetros discretos y sin formato de pesos declarado, no se puede estimar su viabilidad en hardware de consumo.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en el ámbito de las redes neuronales iónicas con conservación de masa y estequiometría de receptores. Las arquitecturas estándar (perceptrones multicapa, transformers) operan bajo la abstracción de voltaje que NIRGEN critica, por lo que la comparación directa no es significativa.

## Limitaciones y advertencias

- Modelo experimental en fase temprana: no hay evidencia publicada de rendimiento en tareas del mundo real más allá de la paridad XOR.
- Sin licencia declarada: no se puede determinar si es utilizable comercialmente o si tiene restricciones de uso.
- Sin formato de pesos ni pipeline definido: no es desplegable con herramientas estándar como vLLM, llama.cpp u Ollama.
- La model card está incompleta: se corta en la sección de evaluación, por lo que no se dispone de información sobre el dataset de entrenamiento, hiperparámetros finales ni resultados numéricos.
- Riesgo de sobreajuste conceptual: el autor presenta el modelo como un "paradigma" que desafía 80 años de conexionismo, pero no se aportan comparaciones cuantitativas con arquitecturas clásicas.
- No es un modelo de lenguaje: no puede utilizarse para generación de texto, código, razonamiento o cualquier tarea de NLP.
- Posibles sesgos no evaluados: al no haber benchmarks estándar, se desconocen sesgos, tasas de alucinación o comportamientos indeseados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drmylesgarveylabs/ion_neural_network
- Perfil del autor en HuggingFace: https://huggingface.co/drmylesgarveylabs
- Repositorio de modelos del autor: https://huggingface.co/drmylesgarveylabs/models
- Perfil de GitHub del autor: https://github.com/drmylesgarveylabs
