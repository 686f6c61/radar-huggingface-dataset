# AI999X/computational-biology-ai999x

## Resumen

computational-biology-ai999x es un motor de cálculo determinista empaquetado como modelo de question-answering para el dominio de la biología computacional, publicado por el autor AI999X bajo licencia Apache 2.0. No es un transformer generativo: se trata de un solver compilado (con implementación principal en Rust y build en Python puro para plataformas no x86-64) que resuelve 86 cálculos organizados en 10 temas, cada uno con su fórmula, sus pasos intermedios y sus unidades. El modelo devuelve una razón explícita en texto plano en lugar de un número cuando una entrada falta o está fuera de rango, lo que el autor presenta como una estrategia de "zero-hallucination".

El alcance declarado cubre secuencias de ADN y proteínas, alineamiento de secuencias (Needleman-Wunsch, Smith-Waterman, BLOSUM62), pesos moleculares, genética y genética de poblaciones (Hardy-Weinberg, deriva genética, desequilibrio de ligamiento), filogenética (parsimonia de Fitch), cinética enzimática (Michaelis-Menten con ajuste no lineal por mínimos cuadrados), modelos metabólicos y de población, y ecología (estimadores de riqueza como ACE, quimiostato con cinética de Monod). Se distribuye en cuatro formatos: aplicación de escritorio para Windows y Linux, CLI, versión web y paquete de Python 3.10+.

Su relevancia es acotada pero clara: para tareas docentes y de verificación de cálculos bioinformáticos, ofrece respuestas reproducibles y offline sin depender de un LLM generativo, con la promesa de resultados idénticos en Windows y Linux sobre Python 3.10-3.14. El repositorio de Hugging Face es de 0.0 GB y los pesos declarados en safetensors suman 4.715.520 parámetros, un orden de magnitud coherente con un motor de reglas y tablas empaquetado, no con una red neuronal de gran tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista (solver compilado, Rust con build Python puro); no es un transformer |
| Parámetros totales | 4.715.520 (según safetensors del repo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de contexto) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0.0 GB); distribución principal como binarios de escritorio/CLI y paquete pip |

## Arquitectura y entrenamiento

El modelo no sigue una arquitectura de red neuronal. Según la model card, es "un motor compilado" que implementa 86 cálculos en 10 temas, cada uno con su fórmula explícita, la secuencia de pasos y las unidades del resultado. La implementación principal es nativa (Rust, según los tags) para Windows y Linux x86-64, y existe una build en Python puro que produce las mismas respuestas en macOS y ARM. La inferencia está desactivada en el Hub (`inference: false`), lo que confirma que no se ejecuta como un modelo alojado convencional.

No se documenta ningún proceso de entrenamiento con tokens, dataset de preentrenamiento, RLHF ni DPO, porque no hay un modelo generativo entrenado. La "evaluación" declarada en el model-index consiste en 640 preguntas documentadas con respuestas doradas, comparadas contra las salidas del motor en Windows y Linux sobre Python 3.10-3.14, con accuracy 1.0 declarada por el autor (métrica marcada como `verified: false`). La innovación técnica destacable es el comportamiento ante entradas inválidas: en lugar de devolver un número plausible, el motor devuelve una explicación del motivo por el que no puede calcularse el resultado.

## Capacidades

- Cálculo determinista de 86 operaciones de biología computacional en 10 temas, con fórmula, pasos y unidades.
- Biología de secuencias: complemento reverso de ADN, traducción, detección de open reading frames, sitios de restricción, temperatura de melting, punto isoeléctrico y pesos moleculares.
- Alineamiento de secuencias: puntuación de alineamiento global (Needleman-Wunsch con gaps lineales), alineamiento local (Smith-Waterman) y matrices de sustitución BLOSUM62.
- Genética y genética de poblaciones: ratios fenotípicos de cruces con dominancia completa, test chi-cuadrado de Hardy-Weinberg, deriva genética y desequilibrio de ligamiento.
- Filogenética: puntuación de parsimonia de un árbol mediante el algoritmo de Fitch.
- Cinética enzimática: ajuste no lineal por mínimos cuadrados de Michaelis-Menten.
- Modelos metabólicos y de población: estado estacionario de un quimiostato con cinética de Monod.
- Ecología: estimadores de riqueza de especies como ACE.
- Resolución paso a paso orientada a ayuda con deberes y verificación de resultados.
- Ejecución completamente offline en el equipo del usuario.
- No soporta tool calling genérico, agentes, razonamiento multi-step abierto ni visión; su "multi-step" se limita a los pasos internos de cada cálculo.
- Multilingüe: no; solo inglés.

## Casos de uso

- Docencia de bioinformática: el alumnado introduce una secuencia y obtiene el complemento reverso, la traducción o los ORFs con los pasos intermedios, lo que permite revisar el procedimiento y no solo el resultado.
- Verificación de cálculos en pipelines bioinformáticos: usar el CLI `computational-biology` para contrastar puntuaciones de alineamiento Needleman-Wunsch o Smith-Waterman con BLOSUM62 frente a los valores que produce un pipeline propio.
- Genética de poblaciones en clase o laboratorio: cálculo del chi-cuadrado de Hardy-Weinberg y del desequilibrio de ligamiento sobre genotipos observados, con interpretación de los grados de libertad y del estadístico.
- Ajuste de curvas de enzimas: estimación de Vmax y Km mediante el ajuste no lineal de Michaelis-Menten a partir de pares concentración-velocidad medidos en el laboratorio.
- Ecología de campo: estimación de riqueza específica con ACE a partir de datos de abundancia por especie recogidos en muestreos.
- Práctica de filogenética: cálculo de la puntuación de parsimonia de Fitch sobre un árbol y un alineamiento dados, útil para comparar topologías alternativas en ejercicios guiados.
- Modelado de bioprocesos: obtención del estado estacionario de un quimiostato con cinética de Monod para dimensionar dilución y concentración de sustrato en un biorreactor didáctico.
- Entornos sin conectividad: despliegue en aulas o laboratorios aislados mediante la app de escritorio o el paquete pip, sin llamadas a servicios externos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Question answering de biología computacional | Golden answers (640 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 ("idéntico en cada plataforma", `verified: false`) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La métrica anterior mide consistencia de salida frente a un conjunto dorado propio, no calidad frente a referencias externas.

## Requisitos de hardware

- VRAM: no aplica; no es un modelo de red neuronal y no requiere GPU.
- CPU: cualquier x86-64 para los binarios compilados de Windows y Linux; para macOS y ARM se usa la build en Python puro.
- Memoria RAM: no disponible en la información proporcionada; por el tamaño del motor (repo de 0.0 GB) el consumo esperable es bajo, pero no hay cifra publicada.
- GPU recomendadas: ninguna; el motor es CPU-only.
- Cabe en cualquier equipo de escritorio o portátil convencional; no requiere GPU de consumo.
- Despliegue: aplicación de escritorio (Windows/Linux), CLI `computational-biology`, versión web en la página del modelo y paquete `pip install computational-biology-ai999x` para Python 3.10+.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| computational-biology-ai999x | Solver determinista de cálculos bioinformáticos | 4.715.520 (safetensors) | no aplica | Apache 2.0 | Hugging Face, pip, escritorio, CLI, web |
| BioBERT / SciBERT (referencia de la categoría) | Transformer de lenguaje científico | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| LLM generalista (p. ej. familia Llama o Mistral) | Transformer generativo | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Hugging Face y múltiples proveedores |

La comparación directa no es posible con rigor: computational-biology-ai999x no es un modelo de lenguaje y no compite en generación abierta ni en razonamiento. Frente a un LLM generalista, su ventaja es la reproducibilidad exacta y la ausencia de alucinación numérica en los 86 cálculos cubiertos; su desventaja es que no responde a nada fuera de ese catálogo. Frente a BioBERT o SciBERT, que son modelos de representación para NLP biomédico, la diferencia de propósito es total. No se dispone de datos de benchmarks comparables en la información proporcionada.

## Limitaciones y advertencias

- Cobertura cerrada: solo resuelve los 86 cálculos documentados en 10 temas; cualquier consulta fuera de ese catálogo no obtiene respuesta válida.
- No es un modelo generativo: no redacta explicaciones libres, no mantiene conversaciones y no razona sobre problemas abiertos.
- Idioma: únicamente inglés; no hay soporte declarado de castellano.
- La accuracy de 1.0 está declarada por el autor sobre un conjunto dorado propio y marcada como no verificada; no equivale a una validación independiente.
- Riesgo de alucinación bajo por diseño en los cálculos cubiertos, pero el motor puede devolver mensajes de error en lugar de resultados cuando la entrada está fuera de rango; es responsabilidad del usuario interpretar esos mensajes.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; conviene revisar el archivo LICENSE del repositorio antes de redistribuir.
- El repositorio en Hugging Face es de 0.0 GB y la inferencia está desactivada en el Hub; el uso real requiere descargar los binarios o instalar el paquete pip desde las fuentes indicadas.
- Sesgos conocidos: no documentados en la información disponible; al ser un motor de reglas, los sesgos relevantes serían los de las fórmulas y supuestos implementados (por ejemplo, modelos de sustitución o de cinética concretos), que no se detallan.
- Sin garantías de soporte a largo plazo ni de mantenimiento: el proyecto depende de un único autor y de su infraestructura (ai999x.com y GitHub AI999X).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/computational-biology-ai999x
- Página del modelo con demo web: https://www.ai999x.com/models/computational-biology-ai999x/
- Sección de capacidades: https://www.ai999x.com/models/computational-biology-ai999x/#capabilities
- App de escritorio Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-computational-biology-1.6.7-windows-x86_64.zip
- App de escritorio Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-computational-biology-1.6.7-linux-x86_64.tar.gz
- CLI Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Clip de demostración (MP4): https://www.ai999x.com/?ax_shot=computational-biology-ai999x/clip.mp4
- Repositorio de la app de escritorio: https://github.com/AI999X/ai999x-desktop
