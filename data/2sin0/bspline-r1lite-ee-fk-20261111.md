# 2sin0/bspline-r1lite-ee-fk-20261111

## Resumen

R1Lite EE B-spline policy es un checkpoint de política robótica basada en difusión (diffusion policy) desarrollado por el usuario 2sin0, entrenado específicamente para el robot R1Lite. El modelo no es un modelo de lenguaje ni un transformer generativo de propósito general: es un checkpoint de PyTorch/Hydra pensado para control robótico de manipulación bimanual, que predice trayectorias de efector final (EE) parametrizadas como B-splines a partir de observaciones visuales y propioceptivas.

La entrada del modelo combina tres cámaras RGB (cabeza y muñecas izquierda y derecha) a resolución 128×128, junto con posiciones articulares de ambos brazos (6 grados de libertad por brazo), estado de las pinzas y poses del efector final codificadas como xyz absoluto más las dos primeras filas de una matriz de rotación (9 dimensiones por brazo). La salida se decodifica como una B-spline en el tiempo del sistema de origen a 31 Hz, con un layout de acción de `[gripper_L, gripper_R, EE_L_9d, EE_R_9d]`.

El modelo es relevante en el contexto de la robótica de imitación y las políticas de difusión para manipulación, pero conviene subrayar que se trata de un artefacto de investigación muy específico: el repositorio pesa 1,9 GB, no declara licencia, no tiene descargas ni likes, y las métricas publicadas corresponden a error en bucle abierto sobre datos de entrenamiento, no a éxito de tarea en robot real. El adaptador ROS2 incluido solo ha pasado pruebas numéricas y de control offline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) con salida B-spline; checkpoint PyTorch/Hydra, no Transformers |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin entrada/salida de lenguaje) |
| Licencia | no disponible (el autor no declara licencia; recomienda verificar permisos del código fuente, datos y pesos) |
| Formato de pesos | Checkpoint PyTorch/Hydra (puede contener estado de entrenamiento además de pesos EMA/modelo); SHA256 `02dd34cc71a515ebd7d3ce8c2ce0e2830568517a13ac84abab267e3358a8686f` |

## Arquitectura y entrenamiento

El modelo es una política de difusión para control robótico. La observación se compone de tres imágenes RGB de 128×128 (cámara de cabeza, muñeca izquierda y muñeca derecha) más el estado propioceptivo: posiciones articulares de cada brazo (6 dimensiones por brazo), estado de cada pinza (1 dimensión por pinza) y pose del efector final (9 dimensiones por brazo, con xyz absoluto y las dos primeras filas de una matriz de rotación). La acción se representa como una B-spline y se decodifica en el tiempo del sistema de origen a 31 Hz; el layout de acción del adaptador es `[gripper_L, gripper_R, EE_L_9d, EE_R_9d]`.

El entrenamiento se realizó con el dataset R1Lite FK, que según la model card comprende 26 episodios y 23.400 fotogramas. La evaluación histórica local usó pesos EMA, 16 pasos de denoising, 32 fotogramas de predicción y 16 fotogramas de ejecución. No se especifican en la información disponible el número de parámetros, la composición detallada del dataset, ni si hubo RLHF/DPO (no aplicable en este dominio) u otras técnicas de ajuste. La innovación destacable es la parametrización de la salida como B-spline, que impone suavidad temporal en las trayectorias predichas frente a una secuencia discreta de acciones.

## Capacidades

- Predicción de trayectorias de efector final bimanual en espacio cartesiano (xyz absoluto más representación de rotación de 9 dimensiones por brazo).
- Control de pinzas izquierda y derecha (una dimensión por pinza).
- Fusión de percepción visual multi-cámara: imagen de cabeza y de ambas muñecas a 128×128.
- Condicionamiento en estado propioceptivo: posiciones articulares de ambos brazos y poses del efector final.
- Generación de acciones suavizadas temporalmente mediante decodificación B-spline a 31 Hz.
- Inferencia por difusión con número configurable de pasos de denoising (16 en la evaluación reportada).
- Integración con ROS2 mediante un adaptador incluido (con comandos de lanzamiento y supuestos de frames documentados en `ADAPTER_README.md`).
- No soporta tool calling, function calling, razonamiento multi-paso textual, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Manipulación bimanual de laboratorio: el modelo genera trayectorias de ambos efectores finales a partir de tres vistas RGB, adecuado para tareas de pick-and-place con dos brazos en el robot R1Lite.
- Investigación en políticas de difusión: sirve como checkpoint de referencia para reproducir y comparar la parametrización B-spline frente a salidas de acción discretas en experimentos de imitación.
- Evaluación de adaptadores ROS2: el adaptador incluido permite probar la integración numérica y de control en un pipeline ROS2 antes de desplegar en hardware real.
- Análisis de error en bucle abierto: con errores de posición reportados de 2,27 mm (izquierda) y 3,07 mm (derecha) sobre datos de entrenamiento, es útil para estudiar la fidelidad del modelo a las trayectorias demostradas.
- Prototipado de control basado en visión: las entradas de 128×128 y el estado propioceptivo permiten montar un bucle percepción-acción de bajo coste computacional en un banco de pruebas.
- Estudio de representaciones de rotación: la codificación de pose como xyz más dos filas de matriz de rotación facilita experimentos sobre el efecto de la representación de orientación en el error de seguimiento.
- Docencia y reproducción: al ser un checkpoint pequeño (1,9 GB) con SHA256 verificado y procedencia registrada en `provenance.json`, es adecuado para ejercicios reproducibles de robótica de imitación.

## Benchmarks y rendimiento

La model card solo reporta errores de posición en bucle abierto sobre datos de entrenamiento, con EMA, 16 pasos de denoising, 32 fotogramas de predicción y 16 de ejecución, sobre 26 episodios y 23.400 fotogramas:

| Métrica | Valor | Condiciones |
|---|---|---|
| Error medio de posición, brazo izquierdo | 2,27 mm | Bucle abierto, datos de entrenamiento |
| Error medio de posición, brazo derecho | 3,07 mm | Bucle abierto, datos de entrenamiento |

El autor advierte explícitamente de que estas cifras no son precisión sobre datos retenidos ni tasas de éxito en tarea real, y que solo aplican al SHA256 evaluado y registrado en `provenance.json`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 1,9 GB, pero incluye posible estado de entrenamiento, por lo que no equivale al peso de los pesos en inferencia.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible; no se especifican requisitos de memoria ni modelo de GPU.
- Opciones de despliegue: carga mediante el código fuente `bspline-policy` y el entorno de entrenamiento correspondiente (PyTorch/Hydra); integración con ROS2 a través del adaptador incluido. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de checkpoint.
- Latencia y throughput: no disponibles. Solo se conoce la frecuencia de decodificación de la B-spline a 31 Hz en el tiempo del sistema de origen.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de difusión, ni datos de modelos alternativos de manipulación bimanual (por ejemplo, otras diffusion policies o políticas de imitación) que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Las métricas publicadas son errores en bucle abierto sobre datos de entrenamiento, no precisión sobre datos retenidos ni tasas de éxito en robot real.
- El adaptador ROS2 incluido solo ha pasado pruebas numéricas y de control offline; no ha sido validado en un robot real.
- No se declara licencia. El propio autor recomienda verificar los permisos del código fuente original, los datos de entrenamiento y los pesos antes de cualquier uso, incluido el comercial.
- El checkpoint puede contener estado de entrenamiento además de los pesos EMA/modelo, lo que exige cargarlo con el entorno y el código fuente adecuados.
- El modelo está entrenado con un dataset muy pequeño (26 episodios, 23.400 fotogramas) y para un robot concreto (R1Lite), por lo que la generalización a otras plataformas, cámaras o configuraciones no está demostrada.
- No hay información sobre sesgos, alucinación en el sentido de modelos generativos, ni cobertura idiomática, porque no es un modelo de lenguaje.
- El repositorio no tiene descargas ni validación por parte de la comunidad, lo que limita la evidencia externa sobre su funcionamiento.
- La decodificación a 31 Hz y los supuestos de frames del adaptador deben respetarse; desviarse de ellos puede producir comandos de control incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2sin0/bspline-r1lite-ee-fk-20261111
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
