# benank/cartmind-1.0-223K

## Resumen

cartmind-1.0-223K es una red neuronal convolucional (CNN) de 223.190 parámetros entrenada mediante aprendizaje por imitación para jugar a Cart Surfer, el minijuego de vagoneta de Club Penguin. Lo desarrolla el usuario benank y lo publica en Hugging Face bajo licencia MIT. El modelo recibe únicamente los últimos cuatro fotogramas de pantalla, reducidos a 84×84 en escala de grises, y emite una acción discreta entre seis posibles (nada, izquierda, derecha, arriba, abajo, espacio). No tiene acceso al estado interno del juego.

El problema que resuelve es el control autónomo de un videojuego a partir de píxeles crudos, un escenario clásico de *behavior cloning* y *dataset aggregation* (DAgger) en el que la retroalimentación es visual y la dinámica es temporal. El modelo completa cursos generados aleatoriamente de cualquier longitud sin perder una vida, derrapa en todas las curvas y mantiene un ritmo alterno de volteretas y giros durante todo el descenso. Está entrenado y evaluado dentro de Club Pyguin, una recreación en Python del minijuego original de Flash.

Es relevante ahora por tres motivos: demuestra que una CNN diminuta (menos de 250.000 parámetros) puede resolver una tarea de control visual con precisión perfecta en un entorno determinista; el repositorio incluye el motor, el renderizador, el generador de cursos y el extractor de assets, lo que facilita la reproducibilidad; y el modelo supera a su propio profesor en la pista clásica, un indicador útil de que la imitación no se limita a copiar al experto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red neuronal convolucional) para imitacion visual; entrada de 4 fotogramas apilados de 84x84 en escala de grises |
| Parametros totales | 223.190 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4 fotogramas consecutivos (ventana temporal de entrada); no aplica contexto textual |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/FP16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de control visual, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

La arquitectura es una CNN compacta que procesa una pila de cuatro fotogramas de 84×84 en uint8, normalizados a [0, 1] dentro del propio modelo. La model card describe las primeras capas como Conv 8×8/4 (16 canales) → Conv 4×4/2 (32 canales) → Conv 3… (el texto se trunca en la información disponible). La salida es una política discreta sobre seis acciones: nada, izquierda, derecha, arriba, abajo y espacio. El agente se integra en un bucle de juego a 24 ticks por segundo mediante la clase `CartSurferAgent`, que expone `reset(first_frame)` y `step(frame)`.

El entrenamiento combina aprendizaje por imitación (*imitation-learning*) y *behavior-cloning* con DAgger, según las etiquetas del repositorio. El profesor es un agente experto cuya puntuación en la pista clásica (2.853) queda por debajo de la del alumno (3.280). No se documentan en la información disponible el número de tokens o episodios de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO (no aplicables a este dominio). La evaluación se realizó con política greedy determinista sobre cursos de 7, 14 y 28 curvas, con semillas reservadas para validación y test final.

## Capacidades

- Control visual de videojuego a partir de píxeles: decide una acción por tick usando solo los cuatro fotogramas más recientes.
- Conducción autónoma de la vagoneta: completa cursos aleatorios de 7, 14 y 28 curvas sin perder vidas.
- Derrape en todas las curvas: 490/490 curvas derrapadas en validación y 2.450/2.450 en el test final.
- Ejecución de trucos: 6.350 volteretas y 6.604 giros en 150 cursos del test final (unas 86 acrobacias por curso), con un 95% aterrizadas con puntuación.
- Generalización a cursos de longitud arbitraria y semillas no vistas.
- No soporta tool calling ni function calling: es un modelo de política visual, no un modelo de lenguaje.
- No soporta agentes multi-step en el sentido de planificación textual; el razonamiento es implícito y reactivo por tick.
- Capacidades multilingües: no disponibles (no procesa lenguaje).
- Capacidades especiales: ninguna modalidad adicional (sin visión semántica, audio ni modo thinking); la “visión” se limita a fotogramas de juego en escala de grises.

## Casos de uso

- Investigación en aprendizaje por imitación: usar el modelo como referencia reproducible de *behavior cloning* + DAgger sobre observaciones visuales, con un entorno incluido (Club Pyguin) que permite reentrenar y comparar políticas.
- Benchmark de políticas visuales ligeras: evaluar técnicas de compresión o destilación sobre una CNN de 223.190 parámetros con métricas claras (cursos completados, vidas perdidas, curvas derrapadas, puntuación media).
- Automatización de pruebas de jugabilidad: ejecutar `play.py --headless` con semillas y números de curvas concretos para verificar de forma determinista que el motor y el renderizador de Club Pyguin siguen funcionando tras cambios de código.
- Docencia en visión por computador: ilustrar el pipeline completo (preprocesado de píxeles, apilado de fotogramas, normalización, política discreta) con un modelo que cabe en cualquier portátil.
- Generación de datos de demostración: grabar partidas del agente para producir trayectorias etiquetadas que sirvan como dataset para otros experimentos de imitación.
- Integración en un bucle propio de juego: importar `CartSurferAgent` y alimentarlo con `Surface` de pygame o arrays `H×W×3` uint8 para controlar variantes o modificaciones del minijuego.
- Estudio de superación del profesor: analizar por qué el alumno supera al experto en la pista clásica (3.280 frente a 2.853) como caso de estudio de errores de imitación y sesgo de distribución.

## Benchmarks y rendimiento

| Evaluacion | Cursos completados | Vidas perdidas | Curvas derrapadas | Puntuacion media (7 / 14 / 28 curvas) |
|---|---|---|---|---|
| Validacion (semillas 1.051.000+) | 30 / 30 | 0 | 490 / 490 | 3.694 / 7.184 / 13.266 |
| Test final no visto (semillas 2.060.000+) | 150 / 150 | 0 | 2.450 / 2.450 | 3.595 / 6.851 / 12.781 |
| Pista clasica | 20 / 20 | 0 | 140 / 140 | 3.280 |

Los cursos del test final no se usaron en entrenamiento, validación ni selección de modelo; la prueba se ejecutó una sola vez tras congelar los pesos. En los 150 cursos del test final se registraron 6.350 volteretas y 6.604 giros (unas 86 acrobacias por curso), con un 95% aterrizadas con puntuación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 223.190 parámetros y el repositorio ocupa 0,0 GB.
- GPU recomendadas: innecesarias; cualquier CPU moderna basta para inferencia en tiempo real a 24 ticks por segundo. Una GPU consumer (por ejemplo, RTX 4090) solo aportaría margen adicional.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU integrada.
- Opciones de despliegue: PyTorch con safetensors (vía `play.py` y `CartSurferAgent`); no se documentan exportaciones a ONNX, vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles de forma numérica; el diseño apunta a una decisión por tick a 24 Hz, holgadamente dentro del presupuesto de cómputo de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cartmind-1.0-223K | 223.190 | 4×84×84 grises | 4 fotogramas | MIT | Hugging Face |
| Políticas CNN de Atari (DQN/A3C) | del orden de 10^5–10^6 | fotogramas de 84×84 | variable | según implementación | literatura y repos públicos |
| Agentes de imitación en entornos tipo Gym | variable | observaciones del entorno | variable | variable | repos públicos |

No se dispone de una comparativa numérica directa con alternativas equivalentes en la información proporcionada; los modelos citados son referencias de categoría (políticas visuales para videojuegos), no comparaciones medidas.

## Limitaciones y advertencias

- Dominio muy restringido: solo funciona en Cart Surfer dentro de Club Pyguin; no es un modelo de propósito general.
- Dependencia de assets externos: el repositorio no incluye gráficos ni sonidos; requiere `CartSurfer2006.swf` con SHA-256 `fd30e04c8de51fbfd970841fac9e761d0f9c41481f77b3bee74524a42fe188f9` y JPEXS FFDec para extraerlos.
- Sensible a cambios de renderizado: otras versiones del SWF se rechazan porque dibujan y suenan de forma distinta, lo que alteraría las observaciones.
- Evaluación determinista: los resultados se obtuvieron con política greedy; no se documenta robustez frente a ruido, latencia variable o modificaciones del juego.
- Riesgo de alucinación no aplicable (no genera texto), pero sí de sobreajuste al entorno de entrenamiento; la generalización solo está demostrada en cursos generados por el mismo generador.
- Sesgos conocidos: no documentados; al imitar a un profesor, puede heredar sus sesgos de comportamiento.
- Restricciones de licencia: MIT permite uso comercial, pero los assets gráficos y sonoros extraídos del SWF original quedan sujetos a los derechos de sus titulares.
- Idiomas y contexto textual: no disponibles; no debe usarse como modelo de lenguaje.
- Para producción: conviene fijar versiones de PyTorch y safetensors, y validar `python play.py --check` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benank/cartmind-1.0-223K
- Vídeo de YouTube sobre cómo aprendió a jugar: https://www.youtube.com/watch?v=PEQ95wlYnyg
- JPEXS FFDec (descompilador de Flash): https://github.com/jindrapetrik/jpexs-decompiler/releases
- Repositorio del modelo: no disponible
- Paper o blog técnico: no disponible
- Demo interactiva: no disponible
