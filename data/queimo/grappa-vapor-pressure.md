# Queimo/grappa-vapor-pressure

## Resumen

GRAPPA es una red neuronal de grafos hibrida disenada para predecir los parametros de Antoine (A, B, C) de componentes puros a partir de su representacion SMILES. El modelo permite estimar la presion de vapor de compuestos quimicos mediante la ecuacion de Antoine, ln(p/kPa) = A - B/(T + C), con la temperatura expresada en kelvin. Fue desarrollado por Marco Hoffmann, Hans Hasse y Fabian Jirasek, y el trabajo asociado se publica en el preprint arXiv:2501.08729.

Este repositorio concreto, alojado por el usuario Queimo bajo el identificador `Queimo/grappa-vapor-pressure`, no introduce modificaciones sobre el modelo original: contiene el state dict publicado sin cambios, empaquetado para que el paquete de propiedades `screening-properties` del framework de cribado de procesos ScreeningTool pueda descargarlo automaticamente en su primer uso. Es, por tanto, una redistribucion de pesos con finalidad de integracion practica.

Su relevancia radica en la aplicacion de aprendizaje automatico sobre grafos a la estimacion de propiedades termodinamicas, un paso previo habitual en el diseno y cribado de procesos quimicos, donde la disponibilidad de datos experimentales de presion de vapor es limitada para muchas especies. El modelo se distribuye bajo licencia MIT y se carga mediante PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos hibrida (graph neural network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada basada en SMILES, no en texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de prediccion de propiedades fisicoquimicas) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`models/GRAPPA_state_dict.pt`, solo tensores, cargar con `weights_only=True`) |

## Arquitectura y entrenamiento

GRAPPA es una red neuronal de grafos hibrida que opera sobre la representacion molecular en forma de SMILES. El modelo transforma la estructura molecular en un grafo y produce como salida los tres parametros de Antoine (A, B, C) que parametrizan la curva de presion de vapor de la especie pura segun ln(p/kPa) = A - B/(T + C), con T en kelvin. La calificacion de "hibrida" proviene de la propia model card y del titulo del trabajo original, si bien la informacion disponible no detalla la composicion exacta de los componentes que combina.

No se dispone en la informacion proporcionada de datos sobre el volumen del conjunto de entrenamiento, el numero de moleculas empleadas, la composicion del dataset ni la existencia de etapas de ajuste fino, RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion lineal. El repositorio contiene unicamente el state dict sin modificaciones respecto a la publicacion original; el codigo y los pesos de referencia se mantienen en el repositorio GitHub de los autores originales.

## Capacidades

- Prediccion de los parametros de Antoine (A, B, C) de componentes puros a partir de su SMILES.
- Estimacion de curvas de presion de vapor en funcion de la temperatura mediante la ecuacion de Antoine.
- Aplicacion a cribado de propiedades fisicoquimicas dentro de frameworks de simulacion y cribado de procesos.
- Integracion con el paquete `screening-properties` del framework ScreeningTool, que descarga los pesos de forma automatica en el primer uso.
- Carga directa como state dict de PyTorch con `weights_only=True`.
- No soporta moleculas con cargas formales.
- No dispone de capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, tool calling ni agentes.

## Casos de uso

- Cribado de disolventes en diseno de procesos: el modelo permite estimar la presion de vapor de candidatos a partir de su SMILES antes de disponer de datos experimentales, lo que facilita descartar especies con volatilidad inadecuada en las primeras fases del estudio.
- Simulacion de procesos quimicos: los parametros de Antoine generados pueden alimentar modelos termodinamicos en simuladores para calcular equilibrios liquido-vapor de componentes puros cuando no se dispone de correlaciones experimentales.
- Evaluacion de riesgos de volatilidad: la prediccion de la curva de presion de vapor en funcion de la temperatura ayuda a identificar compuestos con riesgo de emision a condiciones de operacion concretas.
- Integracion en pipelines de ScreeningTool: al estar empaquetado para `screening-properties`, el modelo se descarga y ejecuta de forma automatica dentro del flujo de cribado de procesos, sin gestion manual de pesos.
- Estimacion de propiedades para compuestos con datos escasos: util en quimica computacional para generar estimaciones preliminares de presion de vapor de especies poco caracterizadas experimentalmente.
- Docencia e investigacion en termodinamica computacional: sirve como ejemplo reproducible de aplicacion de redes de grafos a la prediccion de propiedades de componentes puros, con pesos de acceso libre bajo licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio tiene un tamano de 0,0 GB y el state dict contiene unicamente tensores, por lo que la huella de memoria es reducida, pero no se especifica una cifra concreta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamano del artefacto es previsible que quepa en GPU de consumo, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue: carga directa como state dict de PyTorch; integracion con `screening-properties` (ScreeningTool). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de prediccion de presion de vapor ni resultados comparativos con alternativas.

## Limitaciones y advertencias

- No admite moleculas con cargas formales; las especies ionicas quedan fuera del dominio de aplicacion.
- El modelo predice parametros de Antoine, por lo que su validez esta acotada al rango de temperaturas y al tipo de compuestos cubiertos por los datos de entrenamiento originales, no documentados en esta ficha.
- Riesgo de extrapolacion fuera de la distribucion quimica de entrenamiento; no se dispone de informacion sobre errores o intervalos de confianza.
- No se documentan sesgos especificos ni limitaciones por idioma, al no tratarse de un modelo linguistico.
- Licencia MIT: permite uso comercial y modificacion con atribucion; todos los creditos corresponden a los autores originales (Hoffmann, Hasse y Jirasek).
- Este repositorio es una redistribucion no modificada de los pesos originales; para soporte, codigo y documentacion completa debe consultarse el repositorio GitHub de los autores.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad en esta copia concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Queimo/grappa-vapor-pressure
- Repositorio GitHub original (codigo y pesos): https://github.com/marco-hoffmann/GRAPPA
- Preprint arXiv: https://arxiv.org/abs/2501.08729
