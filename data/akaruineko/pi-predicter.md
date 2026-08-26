# akaruineko/pi-predicter

## Resumen

pi-predicter es un perceptrón multicapa (MLP) desarrollado por akaruineko (Георгий Куликов) que memoriza y predice dígitos del número π. El modelo recibe como entrada un índice de posición y devuelve el dígito correspondiente de π en esa posición, utilizando codificación de características de Fourier (Fourier feature encoding) para transformar posiciones enteras en representaciones de alta dimensión. Está entrenado para memorizar los primeros 100 000 dígitos decimales de π.

La relevancia de este modelo es principalmente educativa y demostrativa: ilustra cómo un MLP con codificación posicional puede actuar como una tabla de consulta eficiente para datos estructurados, con solo ~550 000 parámetros para memorizar 100 000 dígitos. No está diseñado para generalizar más allá del rango de entrenamiento ni para realizar cálculos matemáticos, sino para mostrar las capacidades de memorización de las redes neuronales con codificaciones posicionales. El modelo se publica bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con codificacion de Fourier |
| Parametros totales | ~550 000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada: posicion entera) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada numerica) |
| Licencia | MIT |
| Formato de pesos | PyTorch (model.pt) |

## Arquitectura y entrenamiento

El modelo **PiPredictor** es un perceptron multicapa con tres capas ocultas de 512 dimensiones cada una. La entrada es un entero que representa la posicion del digito de π que se desea predecir (posiciones 1 a 100 000 despues del punto decimal). Esta posicion se transforma mediante una codificacion de Fourier con 16 componentes de frecuencia, que genera un vector de 32 dimensiones. Ese vector se introduce en el MLP de 512 → 512 → 512, cuya salida es una distribucion de probabilidad sobre 10 clases (digitos 0-9). El modelo se entrena para memorizar los digitos de π mediante aprendizaje supervisado, con un objetivo de clasificacion sobre el digito correcto en cada posicion. No se proporciona informacion detallada sobre el conjunto de datos de entrenamiento (mas alla de los 100.000 digitos de π), la funcion de perdida o el optimizador empleado.

## Capacidades

- **Memorizacion de digitos de π**: recupera el digito correcto en cualquier posicion entre 1 y 100.000 tras el punto decimal.
- **Inferencia instantanea**: una vez entrenado, la prediccion es una sola pasada de la red, sin necesidad de calcular π.
- **Inferencia por lotes**: puede procesar multiples posiciones simultaneamente.
- **Codificacion posicional**: emplea Fourier features de 16 frecuencias para representar posiciones enteras.
- **Memoria eficiente**: ~550 000 parametros para 100 000 digitos memorizados.
- **Sin generalizacion**: no puede predecir digitos fuera del rango de entrenamiento ni realizar calculos matematicos.

## Casos de uso

- **Demostracion educativa de memorizacion en redes neuronales**: permite ilustrar como un MLP con codificacion posicional puede memorizar datos estructurados de forma compacta, util en cursos de aprendizaje automatico o deep learning.
- **Estudio de codificaciones posicionales**: sirve como banco de pruebas para comparar tecnicas de codificacion posicional (Fourier, embeddings aprendidos, etc.) en tareas de memorizacion de funciones de alta frecuencia.
- **Comparacion con tablas de consulta**: puede usarse para medir la eficiencia de una red neuronal frente a una tabla hash tradicional en terminos de espacio y velocidad de acceso.
- **Exploracion de limites de capacidad de MLP**: permite estudiar hasta que punto un MLP puede memorizar datos deterministas y donde comienza el sobreajuste.
- **Arte generativo**: el modelo podria integrarse en proyectos artisticos que necesiten generar digitos de π de forma instantanea sin recalcularlos, por ejemplo para visualizaciones o instalaciones interactivas.
- **Prueba de conceptos para compresion de datos**: la capacidad de memorizar 100.000 digitos con ~550 000 parametros sugiere un ratio de compresion aproximado de 1:1,8 (100 000 digitos decimales ≈ 332 000 bits vs ~550 000 parametros × 4 bytes ≈ 2,2 MB), lo que puede servir como ejemplo de compresion ineficiente frente a metodos clasicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no esta disenado para tareas generales de lenguaje o razonamiento, sino para la memorizacion especifica de digitos de π, por lo que no aplican benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM**: al ser un MLP de ~550 000 parametros, la inferencia requiere menos de 10 MB de VRAM en precision de 32 bits (fp32). Cabe en cualquier GPU moderna, incluso en CPU.
- **GPU recomendada**: cualquier GPU con al menos 1 GB de VRAM es suficiente; tambien funciona en CPU sin problemas.
- **GPU de consumo**: si, funciona en cualquier GPU de consumo (GTX 1060 en adelante, RTX 3060, RTX 4090, etc.) y tambien en Apple Silicon con PyTorch.
- **Opciones de despliegue**: puede cargarse con PyTorch directamente; no requiere vLLM, llama.cpp, Ollama ni TGI. Para produccion, basta con un servicio Python con PyTorch.
- **Latencia y throughput**: la inferencia es practicamente instantanea (una sola pasada de red con ~550K parametros). Se estima una latencia inferior a 1 ms en GPU y < 5 ms en CPU para un lote de 1.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada. El modelo es un caso unico de memorizacion de π, sin equivalentes directos en el ecosistema de HuggingFace.

## Limitaciones y advertencias

- **Rango limitado**: solo es valido para posiciones 1-100.000; no predice digitos fuera de ese rango.
- **Sin generalizacion**: no puede predecir digitos de π en posiciones no vistas durante el entrenamiento.
- **Memorizacion, no calculo**: no realiza calculo matematico alguno; es una tabla de consulta neuronal.
- **Posicion 0**: el digito entero (3) no esta incluido en el entrenamiento.
- **Sesgos**: no aplicable, al ser un modelo de memorizacion de datos deterministas.
- **Riesgo de alucinacion**: para posiciones fuera del rango entrenado, el modelo devuelve una prediccion arbitraria sin valor.
- **Restricciones de licencia**: licencia MIT, permite uso comercial sin restricciones, pero se recomienda citar al autor.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/akaruineko/pi-predicter)
- [Perfil de HuggingFace del autor](https://huggingface.co/akaruineko/models)
- [Organizacion GitHub del autor](https://github.com/akaruineko-ai/.github)
