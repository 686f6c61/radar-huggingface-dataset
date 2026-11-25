# At1uri/kolmogorov-arnold-network-symbolic-engine

## Resumen
El repositorio `At1uri/kolmogorov-arnold-network-symbolic-engine` es una implementacion de una red de Kolmogorov-Arnold (KAN) orientada a regresion simbolica y computacion cientifica, publicada por Ramprasad Atluri (usuario `At1uri`). No se trata de un modelo de lenguaje: es un motor matematico de muy pequeno tamano (234 parametros en safetensors) que parametriza funciones de activacion univariantes aprendibles sobre las aristas de la red, en lugar de matrices de pesos estaticas con no linealidades en los nodos. Su interes radica en que permite extraer expresiones simbolicas cerradas a partir de los pesos aprendidos.

La arquitectura sigue el teorema de superposicion de Kolmogorov-Arnold (1957) y emplea B-splines cubicos como base funcional. La topologia declarada es `[2, 5, 1]`, con 15 aristas spline y 8 coeficientes por arista. El autor reporta un R² de extraccion simbolica superior a 0,9995 y una eficiencia de parametros 4,2 veces mayor que un MLP equivalente.

Es relevante como pieza de investigacion reproducible para quien trabaje en regresion simbolica, modelos fisicamente informados (PINN) o interpretabilidad mecanistica de redes neuronales, aunque no es un modelo generativo ni un asistente conversacional. El repositorio no incluye pipeline declarado ni idiomas soportados, y su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kolmogorov-Arnold Network (KAN) con activaciones B-spline cubicas en aristas |
| Parametros totales | 234 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 2 variables) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento
La red se basa en el teorema de superposicion de Kolmogorov-Arnold: cualquier funcion continua multivariante \(f: [0,1]^n \to \mathbb{R}\) puede expresarse como suma finita de funciones univariantes continuas. En lugar de colocar no linealidades fijas en los nodos y pesos lineales en las aristas (como un MLP), la KAN coloca funciones univariantes aprendibles \(\phi_{l,j,i}(x)\) en cada arista. Cada una se parametriza como una base residual suave mas un spline local:

\[
\phi(x) = w_b \, \text{SiLU}(x) + w_s \sum_{m=1}^{G+k} c_m B_m(x)
\]

donde \(B_m\) son B-splines de Cox-de Boor de orden \(k=3\) sobre una malla uniforme adaptativa con \(G=5\) intervalos, lo que da 8 coeficientes aprendibles por arista. La topologia es `[2, 5, 1]`: 2 entradas, 5 nodos ocultos y 1 salida, con 15 aristas spline en total (10 en la capa 0 y 5 en la capa 1). La activacion base es SiLU.

No se dispone de informacion sobre el conjunto de datos de entrenamiento, el numero de tokens o muestras, ni sobre el uso de RLHF, DPO o tecnicas de refinamiento. La model card no documenta el proceso de ajuste mas alla de la formulacion matematica. La innovacion principal es la proyeccion simbolica: dada una arista entrenada, el motor puede ajustar una expresion cerrada (por ejemplo, polinomica o trigonometrica) y devolver su R² de coincidencia, lo que permite destilar la red en formulas interpretables.

## Capacidades
- Aproximacion de funciones multivariantes continuas con solo 234 parametros.
- Regresion simbolica: extraccion de expresiones cerradas por arista mediante `distill_symbolic_candidate`.
- Modelado fisicamente informado (physics-informed ML) en dominios con leyes conocidas.
- Evaluacion forward sobre coordenadas de entrada de dos dimensiones (`[x1, x2]`).
- Inspeccion por capa y por arista de la funcion aprendida (interpretabilidad mecanistica).
- Eficiencia de parametros: el autor declara una relacion de compresion de 4,2 veces frente a MLPs equivalentes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso
- Descubrimiento de leyes fisicas en datos experimentales: dado un conjunto de pares entrada-salida de dos variables, la red se ajusta y luego se destila a una formula cerrada con R² alto, util para publicar relaciones interpretables en lugar de cajas negras.
- Prototipado de modelos sustitutos (surrogate models) en simulacion cientifica: con 234 parametros, la evaluacion forward es trivialmente barata y puede incrustarse en bucles de optimizacion o integradores numericos.
- Docencia e investigacion sobre KAN: el repositorio sirve como implementacion minima y reproducible de la formulacion original, con topologia y malla documentadas.
- Validacion de pipelines de regresion simbolica: el metodo `distill_symbolic_candidate` permite comparar la calidad de la extraccion simbolica por arista antes de escalar a redes mayores.
- Analisis de interpretabilidad: al inspeccionar las funciones \(\phi\) de cada arista se puede auditar que dependencias ha aprendido el modelo, algo imposible en un MLP denso equivalente.
- Benchmarking de eficiencia de parametros: el autor declara una relacion de compresion de 4,2 veces frente a MLPs, util como referencia en estudios comparativos de arquitecturas.

## Benchmarks y rendimiento
Resultados declarados por el autor en el `model-index` (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Aproximacion simbolica de funciones | At1uri/kolmogorov-arnold-symbolic-benchmarks | MSE | 0,0000382 |
| Aproximacion simbolica de funciones | At1uri/kolmogorov-arnold-symbolic-benchmarks | R² de extraccion simbolica | 0,9998 |
| Aproximacion simbolica de funciones | At1uri/kolmogorov-arnold-symbolic-benchmarks | Eficiencia de parametros vs MLP (relacion de compresion) | 4,2 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones independientes con otras KAN o MLP.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 MB para los pesos (234 parametros en safetensors); el repositorio ocupa 0,0 GB.
- GPU recomendadas: cualquiera, incluida CPU. No requiere GPU dedicada; una RTX 4090, A100 o H100 estan sobredimensionadas para este modelo.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores o entornos embebidos.
- Opciones de despliegue: carga directa con `safetensors` y NumPy segun el ejemplo de la model card (`KolmogorovArnoldNetwork.from_pretrained`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; por el tamano (15 aristas spline, 8 coeficientes cada una) la evaluacion forward es del orden de microsegundos en CPU para lotes pequenos.

## Comparativa con modelos similares
No se dispone de comparativas publicadas con otras implementaciones de KAN ni con MLPs de referencia en la informacion proporcionada. La unica comparacion declarada por el autor es la relacion de compresion de 4,2 veces frente a MLPs equivalentes, sin detallar la arquitectura del MLP de referencia ni el dataset exacto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| At1uri/kolmogorov-arnold-network-symbolic-engine | 234 | no aplica | MIT | Hugging Face |
| Alternativas KAN | no disponible | no disponible | no disponible | no disponible |
| MLP equivalente (referencia del autor) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo de investigacion de muy pequeno tamano (234 parametros) y topologia fija `[2, 5, 1]`: no escala a entradas de alta dimensionalidad sin reentrenar.
- No es un modelo de lenguaje ni un asistente: no genera texto, no responde preguntas y no soporta tool calling.
- Los benchmarks del `model-index` estan marcados como no verificados (`verified: false`) y proceden del propio autor; deben tratarse con cautela.
- No se documenta el dataset de entrenamiento, el numero de muestras ni el procedimiento de ajuste, lo que dificulta la reproducibilidad.
- Riesgo de sobreajuste en la extraccion simbolica: un R² de 0,9998 en el conjunto declarado no garantiza generalizacion fuera de la distribucion de entrenamiento.
- No se documentan sesgos, pero al ser un modelo matematico puro el riesgo de sesgo social es practicamente nulo; el riesgo principal es la alucinacion de formulas que no reflejen el fenomeno real.
- La licencia MIT permite uso comercial sin restricciones, pero la falta de documentacion sobre el origen de los datos de entrenamiento impide descartar problemas de licencia en los datos subyacentes.
- No hay informacion sobre cuantizacion, versiones GGUF ni soporte para frameworks de inferencia estandar, lo que limita su integracion en produccion.

## Enlaces
- Hugging Face: https://huggingface.co/At1uri/kolmogorov-arnold-network-symbolic-engine
- Dataset de benchmarks declarado: At1uri/kolmogorov-arnold-symbolic-benchmarks (referenciado en el `model-index`, no se ha verificado su existencia publica)
- Paper original de Kolmogorov-Arnold Networks: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
