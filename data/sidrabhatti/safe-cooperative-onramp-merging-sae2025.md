# SidraBhatti/safe-cooperative-onramp-merging-sae2025

## Resumen

Este repositorio de Hugging Face no contiene un modelo de IA generativa ni pesos entrenados: es el registro bibliografico y el material de acompanamiento de un articulo tecnico sobre control cooperativo de vehiculos conectados y automatizados (CAV) en incorporaciones de autopista. El trabajo propone un marco de control lider-seguidor que combina un controlador de consenso, un filtro de seguridad basado en funciones de barrera de control (CBF) y un metodo de optimizacion por programacion cuadratica (QP) para calcular consensos seguros entre los vehiculos del carril principal y del carril de incorporacion.

Los autores son PeiYu Chang (autor principal), Sidra Bhatti y Nur Uddin Javed, con supervision de Qadeer Ahmed (Ohio State University). El repositorio pertenece a la cuenta de Sidra Ghayour Bhatti, investigadora en OSU. El articulo se publico en SAE Technical Paper con el numero 2025-01-8024, publicado por SAE International, que impone condiciones restrictivas de copyright.

Es relevante ahora porque aborda uno de los escenarios de mayor riesgo de colision en transporte urbano e interurbano, la incorporacion en autopista, y porque extiende un trabajo previo presentado en IEEE ITSC 2024 anadiendo analisis de tiempo hasta la colision (TTC) y margen de seguridad en tres escenarios adicionales de incorporacion: eje X en direccion opuesta, eje X en direccion unica y eje Y en direccion opuesta. El repositorio acumula 0 descargas y 0 likes, y no publica pesos, codigo ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal; framework de control cooperativo compuesto por controlador de consenso, filtro de seguridad basado en funciones de barrera de control (CBF) y optimizacion por programacion cuadratica (QP) |
| Parametros totales | no disponible (no aplica: no se publican pesos ni modelo entrenado) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | sae-international-all-rights-reserved (campo `license: other` con `license_name` propio) |
| Formato de pesos | no disponible (el repositorio no distribuye pesos; solo contiene la model card con cita y abstract) |

## Arquitectura y entrenamiento

El marco descrito no es un modelo de aprendizaje automatico, sino un sistema de control en bucle cerrado para vehiculos conectados y automatizados. Se compone de tres piezas: un controlador de consenso que utiliza la comunicacion entre CAV para disenar un mismo consenso para los vehiculos de los carriles principal y de incorporacion; un filtro de seguridad que requiere la posicion, la velocidad y la distancia de seguridad entre CAV para calcular el conjunto seguro del controlador; y una optimizacion por programacion cuadratica que pondera ambos objetivos y produce una entrada de control cooperativa y segura. El planteamiento es de tipo lider-seguidor.

No existe entrenamiento en el sentido de machine learning: no hay tokens de entrenamiento, ni composicion de dataset, ni fases de RLHF o DPO. La validacion se realiza por simulacion de escenarios de incorporacion en autopista, con los CAV del carril de incorporacion fusionandose a 40 mph, tanto en la misma direccion como en direccion opuesta respecto a los vehiculos del carril principal. La evaluacion se apoya en criterios de seguridad como el tiempo hasta la colision (TTC) y el margen de seguridad. El abstract indica que el control cooperativo evita todos los puntos de colision potenciales y mantiene la distancia de seguridad deseada respecto a los CAV vecinos, pero no se reproducen cifras concretas en la model card.

## Capacidades

- Calculo de consenso cooperativo: genera una referencia de control comun para todos los CAV implicados en la incorporacion, integrando informacion intercambiada por comunicacion V2V.
- Filtrado de seguridad mediante CBF: evalua posicion, velocidad y distancia de seguridad para definir el conjunto de estados seguros y restringir la accion de control.
- Conciliacion consenso-seguridad por QP: resuelve el compromiso entre alcanzar el consenso y no violar las restricciones de seguridad, devolviendo una entrada de control factible.
- Cobertura de escenarios de incorporacion: misma direccion y direccion opuesta respecto al carril principal, en configuraciones de eje X y eje Y.
- Metricas de seguridad: calculo de tiempo hasta la colision (TTC) y margen de seguridad como criterios de validacion.
- No dispone de generacion de texto, razonamiento, generacion de codigo, matematicas simbolicas, vision ni audio.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en el sentido de los sistemas basados en LLM.
- No se declaran capacidades multilingues ni idiomas soportados.

## Casos de uso

- Validacion de algoritmos de incorporacion en simulacion: el framework se ejecuta en un entorno simulado para comprobar si el control cooperativo elimina los puntos de colision potenciales en escenarios de carril principal y de incorporacion, y resulta adecuado porque define explicitamente la dinamica de consenso, el filtro de seguridad y la metrica de exito.
- Generacion de escenarios de prueba para validacion de CAV: los tres escenarios descritos (eje X en direccion opuesta, eje X en direccion unica y eje Y en direccion opuesta) sirven como bateria de casos reproducible para evaluar otras estrategias de control bajo las mismas condiciones de 40 mph.
- Comparacion de filtros de seguridad: al aislar el filtro CBF del controlador de consenso, permite medir el efecto del filtro sobre TTC y margen de seguridad frente a variantes sin filtro o con restricciones mas laxas.
- Base para extension a otras maniobras cooperativas: la estructura consenso + CBF + QP es reutilizable en intersecciones, cambios de carril coordinados o cruces, siempre que se redefinan el conjunto seguro y las restricciones.
- Integracion en gemelos digitales de trafico: el controlador puede acoplarse a un simulador de trafico microscopico para estudiar el impacto agregado de flotas cooperativas en la capacidad de la incorporacion.
- Analisis de cumplimiento de criterios de seguridad: las metricas TTC y margen de seguridad permiten documentar evidencia para procesos internos de validacion o discusiones regulatorias sobre conduccion automatizada.
- Formacion e investigacion academica: el articulo y su escenario de simulacion sirven como material de referencia en cursos y trabajos de posgrado sobre control cooperativo y sistemas multiagente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El abstract afirma que la simulacion demuestra la eficacia del framework y que se evitan todos los puntos de colision potenciales manteniendo la distancia de seguridad deseada, pero no se reproducen tablas, figuras ni valores numericos de TTC o margen de seguridad, ya que la model card los omite deliberadamente por restricciones de copyright de SAE International. El DOI del articulo es la unica via indicada para consultar los resultados completos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no aplica; no hay pesos ni inferencia de red neuronal).
- GPU recomendadas: no disponible. El trabajo se sustenta en simulacion numerica de la dinamica de los vehiculos y en la resolucion de programas cuadraticos, por lo que la carga es de CPU y no requiere acelerador grafico.
- Compatibilidad con GPU de consumo: no disponible; no se declara ningun requisito de aceleracion.
- Opciones de despliegue: no disponible. No se publican artefactos desplegables ni integraciones con vLLM, llama.cpp, Ollama, TGI u otros servidores de inferencia, que ademas no aplican a este tipo de sistema.
- Latencia y throughput estimados: no disponible. No se especifican tiempos de computo, frecuencia de control ni paso de simulacion.
- Entorno de ejecucion: no disponible en la informacion proporcionada; el abstract solo indica que la validacion se realizo mediante simulacion.

## Comparativa con modelos similares

No disponible. No se dispone de datos comparativos publicados en la informacion proporcionada, ni de cifras de rendimiento del propio framework que permitan contrastarlo con alternativas de la misma categoria, como controladores predictivos basados en modelo (MPC) para incorporacion cooperativa, controladores de consenso sin filtro de seguridad o estrategias reactivas de evitacion de colisiones. El repositorio tampoco identifica modelos comparables ni referencias con resultados numericos reproducibles.

## Limitaciones y advertencias

- No es un modelo de IA generativa: no contiene pesos, tokenizador, configuracion de inferencia ni pipeline. Cualquier expectativa de uso como LLM es incorrecta.
- La model card omite deliberadamente figuras, tablas y texto extendido del articulo por las condiciones de copyright de SAE International; no se pueden verificar los resultados numericos a partir del repositorio.
- Licencia restrictiva: `sae-international-all-rights-reserved` implica reserva de todos los derechos, lo que limita la reproduccion y el uso comercial del contenido sin autorizacion expresa.
- Los derechos de autoarchivo de los autores estan pendientes de confirmacion segun la propia model card, por lo que el contenido publicado podria cambiar.
- Validacion exclusivamente en simulacion: no se declaran pruebas en vehiculos reales, en pista cerrada ni con hardware de comunicacion V2V real, lo que limita la extrapolacion a produccion.
- Dependencia de supuestos de comunicacion: el controlador de consenso presupone intercambio fiable de informacion entre CAV; no se detallan en la informacion disponible el comportamiento ante latencia, perdida de paquetes o suplantacion.
- Escenarios acotados: los resultados se refieren a incorporaciones a 40 mph en configuraciones de eje X y eje Y; no se documenta comportamiento en otras velocidades, geometrias o densidades de trafico.
- Sin datos de sesgo ni de alucinacion aplicables, pero tampoco se documentan analisis de robustez frente a sensores ruidosos o fallos de actuador.
- Sin comunidad ni adopcion: 0 descargas y 0 likes, sin issues ni contribuciones externas conocidas.
- Idiomas soportados no declarados.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/SidraBhatti/safe-cooperative-onramp-merging-sae2025
- Repositorio companion del trabajo previo (IEEE ITSC 2024): https://huggingface.co/SidraBhatti/safe-cooperative-control-av-itsc2024
- Articulo publicado (DOI): https://doi.org/10.4271/2025-01-8024
- Cita completa: P. Y. Chang, S. Bhatti, N. U. Javed y Q. Ahmed, "Safe Cooperative Control Framework for Highway On-Ramp Merging", SAE Technical Paper 2025-01-8024, 2025.
