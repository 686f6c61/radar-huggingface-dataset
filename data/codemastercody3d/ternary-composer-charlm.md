# CodeMasterCody3D/ternary-composer-charlm

## Resumen

ternary-composer-charlm es un modelo de lenguaje a nivel de carácter desarrollado por Cody Dixon (CodeMasterCody3D, con Claude/Anthropic como colaborador de ingeniería) dentro del proyecto de investigación TernaryTest. Su particularidad es que es estrictamente ternario: todos los pesos lineales toman valores en {-1, 0, +1}, lo que lo sitúa en la línea de investigación de cuantización extrema a 1,58 bits (2 bits empaquetados) aplicada mediante quantization-aware training (QAT). No es un modelo conversacional ni un producto, sino un checkpoint de investigación publicado mientras el paper asociado sigue sin terminar.

Arquitectónicamente es un transformer pequeño con atención ternaria y una FFN "Composer lane-FFN" de 4 lanes condicionales gobernadas por una puerta sigmoide también ternaria. Tiene 1.325.056 parámetros ternarios, dimensión d=128, 4 bloques, 4 cabezas, contexto de 16 caracteres y un vocabulario de 96 caracteres. En su forma desplegada a 2 bits ocupa unos 323 KB, frente a los ~2,6 MB que ocuparía en fp16.

Su relevancia actual es doble: por un lado demuestra que es posible entrenar attention estrictamente ternaria a pequeña escala con la receta "alive-init"; por otro, sus resultados sugieren que la ternarización estricta actúa como regularizador y generaliza mejor que un modelo float equivalente que sobreajusta el corpus. Es, por tanto, un artefacto de investigación para quien estudia QAT extrema, no una herramienta lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de caracter, pesos lineales estrictamente ternarios; Composer lane-FFN (4 lanes + puerta sigmoide ternaria) y atencion ternaria |
| Parametros totales | 1.325.056 parametros ternarios (distribucion aproximada: 21% -1, 58% 0, 21% +1) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 16 caracteres |
| Tipos de cuantizacion | Ternaria estricta {-1, 0, +1}; pesos latentes en fp32 durante el entrenamiento y ternarizacion determinista `round(clamp(w, -1, 1))` en inferencia; empaquetado a 2 bits por peso en despliegue |
| Idiomas soportados | no disponibles (vocabulario de 96 caracteres; corpus compuesto por wiki, registros de chat de razonamiento y trazas aritmeticas) |
| Licencia | no disponible (la model card indica que el autor la definira; sin especificar en el momento de la publicacion) |
| Formato de pesos | PyTorch (`.pt` con `state_dict`, `config` y `vocab`); pesos latentes fp32 en `best_model.pt`, vocabulario en `charset.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de 4 bloques con d=128 y 4 cabezas, pero con una diferencia clave respecto a un transformer convencional: todas las capas lineales son ternarias. La FFN no es una MLP estandar, sino una "Composer lane-FFN" con 4 lanes condicionales cuyas activaciones se controlan mediante una puerta sigmoide igualmente ternaria, lo que aporta capacidad condicional a coste de parametros muy bajo. La ablacion recogida en la model card situa el punto dulce en 4 lanes; probar 8 lanes empeora y aumentar la profundidad a 6 bloques resulta inestable.

El entrenamiento usa QAT con estimador de paso directo (STE) sobre pesos latentes en fp32, optimizador Adam con learning rate 3e-3, scheduler de cosine LR, entre 40.000 y 60.000 pasos, batch de 128 y contexto de 16. El corpus son 4,65 MB de texto a nivel de caracter (wiki, registros de chat con formato de razonamiento y trazas aritmeticas) con particion contigua 90/10. La innovacion tecnica mas destacada del trabajo es la receta "alive-init": con la inicializacion habitual `1/√d` casi ningun peso ternario se activa (queda en 0) y la red arranca muerta; inicializar los latentes con desviacion tipica proxima a 0,30 deja en torno al 10% de pesos vivos y desbloquea el entrenamiento de la attention ternaria. Segun la model card, este cambio fue el que hizo posible la formulacion estrictamente ternaria.

## Capacidades

- Generacion de texto a nivel de caracter sobre un vocabulario de 96 simbolos.
- Reproduccion de formato de razonamiento: genera secuencias del tipo `<think>...</think> The answer is...`.
- Reproduccion de patrones aritmeticos y de conversion de unidades presentes en el corpus.
- Prediccion de siguiente caracter con una precision de 0,723 en el conjunto de test retenido (frente a 0,166 de la linea base unigram).
- Cuantizacion ternaria estricta en todas las capas lineales, con un tamano desplegable de ~323 KB a 2 bits.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en el sentido de un LLM conversacional.
- No dispone de capacidades multilingues declaradas ni de vision o audio.
- No es un modelo de chat: la model card lo describe explicitamente como un char-LM de investigacion.

## Casos de uso

- Investigacion en cuantizacion ternaria (QAT): sirve como punto de partida reproducible para estudiar tecnicas de ternarizacion estricta, gracias a que la receta completa (`train_best.py`) y los pesos latentes se distribuyen en el repositorio.
- Estudio de la inicializacion en redes ternarias: el modelo permite reproducir y analizar el fenomeno de "red muerta" con la inicializacion `1/√d` y validar la receta alive-init como solucion.
- Prototipado en dispositivos embebidos o microcontroladores: con ~323 KB a 2 bits y solo 1,3M de parametros, es viable ejecutarlo en hardware muy limitado para experimentos de inferencia ternaria.
- Docencia y divulgacion sobre quantizacion extrema: su tamano y su codigo simple permiten usarlo como ejemplo didactico de como se entrena y despliega un modelo 1,58-bit.
- Analisis de regularizacion implicita: el hecho de que el modelo ternario (0,682 acc en el baseline float equivalente, pero 1,305 b/c frente a 4,789 b/c del float) generalice mejor permite estudiar el efecto regularizador de la ternarizacion en corpus pequenos.
- Generacion de texto acotada a dominios muy especificos: para completar expresiones aritmeticas o conversiones de unidades repetitivas dentro de un dominio cerrado y con contexto de 16 caracteres.
- Base para ablaciones academicas: la model card recoge comparaciones de numero de lanes, profundidad, anchura y volumen de datos que pueden reutilizarse como linea base en estudios de escalado de modelos ternarios.
- Demostraciones de inferencia de bajo consumo: util para ilustrar despliegues con huella de memoria minima frente a un equivalente fp16 (~2,6 MB), sin requisitos de GPU.

## Benchmarks y rendimiento

Los datos publicados son metricas propias del autor sobre el conjunto de test retenido, no benchmarks estandarizados (no hay MMLU, HumanEval ni GSM8K):

| Metrica | Valor |
|---|---|
| Precision de siguiente caracter (ternario) | 0,723 |
| Bits por caracter (ternario) | 1,305 |
| Precision de siguiente caracter (baseline float, misma arquitectura y presupuesto) | 0,682 |
| Bits por caracter (baseline float) | 4,789 (sobreajusta) |
| Precision de siguiente caracter (linea base unigram) | 0,166 |
| Parametros ternarios | 1.325.056 |
| Tamano desplegado a 2 bits | ~323 KB (frente a ~2,6 MB en fp16) |

No se han publicado resultados de benchmarks estandarizados en la informacion disponible. La progresion de precision reportada durante el desarrollo fue 0,308 → 0,45 → 0,604 → 0,624 → 0,663 → 0,703 → 0,723.

## Requisitos de hardware

- VRAM estimada: minima. Los pesos latentes fp32 ocupan aproximadamente 5,3 MB (1.325.056 × 4 bytes); la forma desplegada ternaria a 2 bits ronda los 323 KB.
- GPU recomendadas: cualquier GPU es suficiente; el modelo se entreno en una unica Kaggle T4. No requiere A100 ni H100.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo, e incluso en CPU o en hardware embebido.
- Opciones de despliegue: inferencia directa con PyTorch cargando `best_model.pt` y ternarizando con `round(clamp(w, -1, 1))` mediante `generate.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible no incluye especificaciones detalladas de modelos comparables. Se puede establecer una comparacion cualitativa:

| Modelo | Parametros | Contexto | Precision ternaria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ternary-composer-charlm | 1.325.056 | 16 caracteres | Si, estricta en pesos lineales | no disponible | Checkpoint en HuggingFace |
| Baseline float equivalente (misma arquitectura) | no disponible | 16 caracteres | No | no disponible | Descrito en la model card, no publicado como checkpoint |
| BitNet b1.58 (linea de investigacion de 1,58 bits) | no disponible | no disponible | Si | no disponible | Referencia de la literatura; no comparada numericamente en la informacion disponible |
| TernaryLLM (arxiv 2406.07177) | no disponible | no disponible | Si (ternarizacion de LLM) | no disponible | Paper; no comparada numericamente en la informacion disponible |

No se dispone de datos numericos de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo muy pequeno (1,3M de parametros) entrenado sobre un corpus de 4,65 MB: es un artefacto de investigacion, no un producto.
- Contexto de solo 16 caracteres, lo que limita severamente cualquier tarea de generacion o razonamiento extenso.
- Aunque los pesos son estrictamente ternarios, el entrenamiento completo no lo es: Adam, LayerNorm y softmax operan en coma flotante. Un entrenamiento puramente entero sigue siendo un objetivo abierto.
- Los embeddings, las LayerNorm y los sesgos permanecen en fp32, de modo que el modelo no es ternario de extremo a extremo.
- No es un modelo de chat y carece de alineacion conversacional, tool calling y capacidades de agente.
- Riesgo de alucinacion y de generacion incoherente: la propia model card describe la salida como "coherent-ish", no plenamente coherente.
- Sesgos conocidos: no documentados; el corpus combina wiki, registros de chat de razonamiento y trazas aritmeticas, por lo que puede heredar los sesgos de esas fuentes.
- Idiomas soportados: no declarados; el vocabulario de 96 caracteres y la composicion del corpus apuntan a un uso muy restringido.
- Licencia sin definir en el momento de la publicacion ("to be set by the author"), lo que impide determinar si se permite uso comercial.
- El paper asociado esta sin terminar, por lo que no existe documentacion metodologica completa ni revision por pares.
- No se han publicado benchmarks estandarizados, de modo que las metricas de la model card son autodeclaradas y no comparables directamente con las de otros modelos.
- Sin descargas ni likes registrados en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CodeMasterCody3D/ternary-composer-charlm
- Perfil del autor en HuggingFace: https://huggingface.co/CodeMasterCody3D
- Listado de modelos del autor: https://huggingface.co/CodeMasterCody3D/models
- Perfil de GitHub del autor: https://github.com/CodeMasterCody3D
- Paper de referencia TernaryLLM: https://arxiv.org/abs/2406.07177
- Video divulgativo sobre modelos ternarios: https://www.youtube.com/watch?v=lDlkkDs43aw
