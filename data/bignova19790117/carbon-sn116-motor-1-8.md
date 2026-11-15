# bignova19790117/carbon-sn116-motor-1.8

## Resumen

Motor 1.8 `v5a` es un modelo surrogate desarrollado por el usuario `bignova19790117` para la competición Electric Motor Magnetics 1.8 de Carbon, la subred 116 de Bittensor. El modelo resuelve un problema de ingeniería electromagnética: dado un diseño de motor de imán superficial definido por ocho entradas (grosor de imán, abrazadera, entrehierro, apertura de ranura, anchura de diente, radio del fondo de ranura, densidad de corriente y ángulo de corriente), devuelve la curva de par en 60 posiciones del rotor y el enlace de flujo de las tres fases.

A diferencia de un modelo de lenguaje, se trata de un híbrido físico-aprendido: incorpora un solver de campo magnético de elementos finitos sobre malla gruesa implementado en JAX, dos redes neuronales pequeñas que corrigen los armónicos de par y flujo, y una corrección final de kernel ridge entrenada sobre el conjunto TRAIN público de Carbon. El modelo se empaqueta como grafo de nivel 4 para el validador de Carbon y ocupa 32.592 de los 32.768 bytes permitidos.

Es relevante porque ilustra un patrón de modelado científico híbrido (física + corrección aprendida) en un entorno con restricciones extremas de tamaño y con un mecanismo de evaluación descentralizado. El modelo fue enviado a la mainnet el 15 de noviembre de 2026 y, según la model card, aún no ha sido calificado oficialmente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: solver de elementos finitos en malla gruesa (JAX) + dos redes feedforward de corrección + kernel ridge con kernel Matérn |
| Parámetros totales | No disponible (redes de 76×76 y 20×20 unidades; el modelo completo ocupa 32.592 bytes) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de regresión sobre 8 entradas de diseño) |
| Tipos de cuantización | No disponible (pesos de la red de par en 8 bits con una escala por columna de salida) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Grafo serializado (`lowered_graph/` con `manifest.json` y tres documentos de grafo) y código fuente JAX en `source/` |

## Arquitectura y entrenamiento

El modelo combina cuatro componentes. En primer lugar, `femc.py` implementa un solver de campo magnético sobre una malla estructurada gruesa de un paso polar, con la ley de hierro de Brauer y 15 posiciones del rotor por diseño; este componente es puramente físico y no está ajustado. En segundo lugar, `disc.py` contiene dos redes fijas: una para los armónicos 0 a 7 del par (20 entradas, 76×76 unidades ocultas, pesos de 8 bits con una escala por columna de salida) y otra para los armónicos del enlace de flujo en circuito abierto (18 entradas, 20×20 unidades). En tercer lugar, `motor_recipe.py` ensambla los componentes y añade una corrección de kernel ridge con kernel Matérn sobre la curva de par. Por último, `spec_motor18.py` es el punto de entrada que lee la herramienta de lowering de Carbon.

El entrenamiento de la parte aprendida se realiza durante la propia ejecución de entrenamiento de Carbon: 1.164 pasos de SGD, tamaño de lote 1, tasa de aprendizaje 1.0, sin momento (beta1 0), sin weight decay, pérdida MSE y tasa de aprendizaje constante sobre el conjunto TRAIN público completo (194 filas). Las dos redes de corrección se ajustaron offline sobre aproximadamente 42.000 resoluciones de referencia generadas con el kit público de Carbon, con diseños extra en las regiones donde el error se concentraba (entrehierro estrecho, corriente baja, ángulo de corriente alto). La innovación técnica principal es la separación entre el conocimiento físico (que generaliza fuera del rango de entrenamiento) y la corrección aprendida (que captura el error residual de la malla gruesa).

## Capacidades

- Predicción de la curva de par en 60 posiciones del rotor para diseños de motor de imán superficial con 8 polos y 24 ranuras.
- Predicción del enlace de flujo de las tres fases, incluyendo la forma de la fuerza electromotriz en circuito abierto.
- Generalización física fuera del rango de entrenamiento gracias al solver de elementos finitos integrado, con comportamiento sensato en saturación y a corriente cero.
- Corrección de armónicos de par (órdenes 0 a 7) mediante red neuronal fija.
- Corrección del error residual de la curva de par mediante kernel ridge ajustado sobre el conjunto TRAIN público.
- Empaquetado como grafo de nivel 4 compatible con el validador de Carbon para la competición `electric-motor-magnetics` 1.8.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni visión; no es un modelo generativo de texto.

## Casos de uso

- Optimización de diseño de motores en bucle cerrado: el modelo evalúa diseños candidatos en milisegundos y permite explorar el espacio de ocho parámetros de entrada con algoritmos de optimización bayesiana, sustituyendo resoluciones FEM completas.
- Filtrado previo en pipelines de ingeniería: dado un lote de diseños generados por un optimizador, el modelo descarta los que presentan un rizado de par excesivo antes de lanzar la simulación de alta fidelidad.
- Minería en la subred 116 de Bittensor: el modelo puede enviarse como solución de nivel 4 al validador de Carbon para obtener una calificación en la competición Electric Motor Magnetics 1.8.
- Análisis de sensibilidad paramétrica: al ser diferenciable en JAX, permite calcular gradientes del par medio y del rizado respecto a los ocho parámetros de diseño para guiar la exploración.
- Estimación rápida de la forma de la fuerza electromotriz: la red de flujo permite aproximar la forma de la onda de back-EMF en circuito abierto sin resolver el campo completo, útil para cribar diseños en etapas tempranas.
- Docencia e investigación en modelado híbrido: sirve como ejemplo reproducible de integración de un solver físico con correcciones neuronales y de kernel ridge bajo restricciones estrictas de tamaño (32 KB).
- Validación cruzada de simuladores: las predicciones pueden compararse con resoluciones FEM de referencia para detectar discrepancias sistemáticas en la malla gruesa.

## Benchmarks y rendimiento

Los datos de la model card corresponden al error de la fracción de rizado predicha (pico a pico sobre par medio) frente a resoluciones de referencia, en el percentil 97, sobre conjuntos no vistos durante el ajuste. La tabla compara el solver de campo con la corrección original frente a este modelo. No son calificaciones oficiales de Carbon.

| Conjunto retenido | Solver + corrección original | Este modelo |
|---|---|---|
| Diseños ordinarios en rango (43 diseños) | 0,0096 | 0,0040 |
| Diseños cerca de los bordes de la caja (150 diseños) | 0,0167 | 0,0071 |
| Entrehierro estrecho, corriente baja, ángulo alto (125 diseños) | 0,0335 | 0,0105 |
| Entrehierros más estrechos (100 diseños) | 0,0311 | 0,0120 |

La comprobación de práctica de Carbon sobre sus seis diseños de verificación publicados indica que el modelo es elegible y no presenta fallos de compuerta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo completo ocupa 32.592 bytes de grafo serializado y las redes son de tamaño muy reducido.
- GPU recomendadas: cualquier GPU compatible con JAX, incluidas NVIDIA T4, RTX 3060 o superiores; el solver de elementos finitos se beneficia de aceleración por hardware pero no la requiere.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: JAX como runtime principal; el grafo de nivel 4 se ejecuta a través de las herramientas de Carbon (`carbon.level4.tooling`); no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos surrogate de la subred 116 de Bittensor ni alternativas comparables en parámetros, contexto o licencia.

## Limitaciones y advertencias

- El modelo no tiene calificación oficial de Carbon; las cifras de precisión son mediciones propias del autor sobre resoluciones de referencia y no deben interpretarse como una nota de la competición.
- Carbon devuelve la calificación de la primera copia ante un reenvío de una receta ya calificada, por lo que reenviar exactamente estos archivos tras su calificación no genera un resultado nuevo.
- Las redes de corrección se ajustaron para la caja de entradas de Motor 1.8 y la región inmediatamente exterior; lejos de ese rango solo la física del solver sostiene la predicción.
- El solver de campo está construido para el marco de máquina fijo de Carbon (8 polos, 24 ranuras); no es un solver de motores general.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial.
- No se especifican sesgos conocidos ni riesgos de alucinación en el sentido habitual, pero al ser un modelo de regresión física, sus predicciones fuera del dominio de entrenamiento pueden degradarse sin aviso.
- El tamaño del modelo está limitado a 32.768 bytes, lo que restringe la capacidad de las redes de corrección y obliga a depender del solver físico para la generalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bignova19790117/carbon-sn116-motor-1.8
- Subred 116 de Bittensor (Carbon): no disponible en la información proporcionada.
- Repositorio de Carbon y herramientas de nivel 4: no disponible en la información proporcionada.
- Paper o blog del autor: no disponible en la información proporcionada.
