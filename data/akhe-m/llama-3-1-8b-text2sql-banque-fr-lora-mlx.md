# akhe-m/Llama-3.1-8B-Text2SQL-Banque-FR-LoRA-MLX

## Resumen

Llama-3.1-8B-Text2SQL-Banque-FR-LoRA-MLX es un adaptador LoRA en formato mlx-lm para el modelo base meta-llama/Llama-3.1-8B-Instruct, desarrollado por el usuario akhe-m. Su funcion es traducir preguntas de negocio en frances a consultas SQLite sobre un esquema bancario sintetico concreto de tres tablas (clients, abonnements, factures). No se trata de un modelo text-to-SQL generalista: es un ajuste fino de dominio muy estrecho, entrenado y evaluado exclusivamente sobre datos sinteticos generados con Faker y preguntas generadas por IA.

El adaptador es relevante como ejemplo reproducible de QLoRA sobre Apple Silicon con MLX: el autor documenta el pipeline completo (generacion del dataset, entrenamiento, benchmark y agente) en un repositorio publico. El resultado principal es un incremento de execution accuracy del 18 % al 42 % en el split de test, con un 98 % de consultas SQL sintacticamente validas.

El adaptador pesa 42 MB (solo pesos LoRA, rango 8 sobre las 16 ultimas capas) y requiere el modelo base Llama 3.1 8B Instruct cuantizado en 4 bits con mlx-lm 0.32.2 para reproducir los resultados. La licencia derivada es la Llama 3.1 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 42 MB de pesos LoRA (0,13 % de los parametros del modelo base, segun el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | El adaptador se entreno y evaluo sobre el modelo base cuantizado en 4 bits (grupo 64) con mlx-lm; existe version GGUF para llama.cpp |
| Idiomas soportados | Frances (fr) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | adapters.safetensors (mlx-lm); version GGUF en repo separado |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8, scale 20 y dropout 0, aplicado sobre las 16 ultimas capas del modelo base Llama 3.1 8B Instruct. El entrenamiento se realizo con QLoRA mediante mlx-lm 0.32.2 (mlx 0.32.4) sobre el modelo base cuantizado en 4 bits, con Adam, learning rate 1e-5, batch 2, perdida maskeada sobre el prompt (--mask-prompt) y semilla 42. Se usaron 441 ejemplos de entrenamiento y 50 de desarrollo, extraidos del split train del dataset sintetico.

El entrenamiento duro 660 iteraciones (3 epocas) en 79 minutos sobre un Mac Apple M5 de 24 GB. El punto de control retenido fue la iteracion 440 (2 epocas), seleccionada por perdida de validacion (0,067). El dataset se genero con Faker y preguntas sinteticas, sobre un unico esquema de tres tablas. El prompt de inferencia debe replicar exactamente el prompt de entrenamiento: reglas SQLite, esquema CREATE TABLE y valores posibles de las columnas categoricas, construido por build_messages en src/text2sql/prompts.py. La generacion se hace en decodificacion glotona (temperatura 0).

## Capacidades

- Generacion de consultas SQLite a partir de preguntas de negocio en frances, limitadas al esquema clients, abonnements y factures.
- Produccion de SQL sintacticamente valido en el 98 % de los casos del test con el adaptador (frente al 86 % sin adaptador).
- Inferencia local en Apple Silicon mediante MLX.
- Ejecucion en CPU/GPU via llama.cpp gracias a la version GGUF publicada en repo separado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al frances para esta tarea.

## Casos de uso

- Prototipado de asistentes de consulta sobre bases de datos bancarias sinteticas: el adaptador traduce preguntas en frances a SQLite sobre el esquema de tres tablas, util para demos y pruebas de concepto en local sin enviar datos a la nube.
- Evaluacion de pipelines text-to-SQL en entornos de investigacion: el repositorio incluye benchmark, dataset y agente, lo que permite reproducir el 42 % de execution accuracy y comparar variantes (0-shot frente a few-shot).
- Desarrollo y depuracion de agentes SQL en local sobre Mac: al ejecutarse con MLX en un M5 de 24 GB, sirve para iterar sobre prompts y validacion de consultas sin coste de API.
- Generacion de consultas de solo lectura para cuadros de mando internos: el modelo produce SELECT sobre el esquema entrenado, adecuado para informes acotados de clientes, suscripciones y facturas.
- Base para un ajuste fino posterior en dominios concretos: al ser un LoRA de 42 MB, se puede reentrenar o adaptar a otros esquemas partiendo de este punto de control como referencia metodologica.
- Educacion y formacion en QLoRA con MLX: el autor documenta hiperparametros, curvas de perdida y seleccion de checkpoint, lo que lo convierte en material didactico reproducible en hardware de consumo Apple.

## Benchmarks y rendimiento

El autor publica un benchmark propio de 100 preguntas de validacion y 100 de test sobre la base sintetica, con execution accuracy (EX) como metrica principal. Resultados en test (modelo 4 bits bajo MLX, 0-shot):

| Configuracion | SQL valido | Execution accuracy (EX) |
|---|---|---|
| Sin adaptador | 86 % | 18 % |
| Con adaptador | 98 % | 42 % |
| Test de McNemar (SQL valido) | +12/-0, p < 0,001 | No aplica |
| Test de McNemar (EX) | No aplica | +27/-3, p < 0,001 |

En validacion, la EX pasa del 17 % al 40 %. Anadir 5 ejemplos en el prompt (few-shot) no aporta mejora significativa con el adaptador: 39,7 % ± 2,3 sobre 3 semillas. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, Spider, BIRD) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 42 MB; el requisito real es el modelo base Llama 3.1 8B Instruct cuantizado en 4 bits.
- Entrenamiento realizado en un Mac Apple M5 con 24 GB de memoria unificada (79 minutos, 660 iteraciones).
- Inferencia validada en Apple Silicon con mlx-lm 0.32.2 y mlx 0.32.4; no se documentan requisitos de VRAM para GPU NVIDIA en la informacion disponible.
- Despliegue posible con mlx-lm (formato nativo del adaptador) y con llama.cpp/Ollama mediante la version GGUF publicada en repo separado.
- No se publican datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Text2SQL-Banque-FR-LoRA-MLX | LoRA de 42 MB sobre 8B | No disponible | Text-to-SQL frances, esquema unico | Llama 3.1 Community License | Hugging Face (MLX y GGUF) |
| Llama 3.1 8B Instruct (base) | 8B | No disponible en la informacion proporcionada | Instrucciones generales | Llama 3.1 Community License | Hugging Face |
| Alternativas text-to-SQL generalistas (p. ej. modelos especializados en Spider/BIRD) | No disponible | No disponible | Text-to-SQL multi-esquema | No disponible | No disponible |

No se dispone de datos de benchmarks comparables con otros adaptadores text-to-SQL en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito muy estrecho: entrenado sobre un unico esquema de tres tablas con datos y preguntas sinteticas; no se ha probado en ningun otro esquema.
- La mayoria de los errores son silenciosos: 98 consultas se ejecutan pero solo 42 son correctas en test.
- El autor senala que parte de la mejora proviene de la eleccion de columnas, en parte arbitraria en el benchmark, mas que de una mejor logica SQL.
- Muestras pequenas: 100 preguntas de test y entre 7 y 9 por familia de consultas, lo que limita la significacion estadistica.
- Riesgo de alucinacion en nombres de columnas, tablas o valores categoricos fuera del esquema entrenado.
- Dependencia estricta del prompt de entrenamiento: desviarse de las reglas SQLite, el CREATE TABLE y los valores categoricos degrada la calidad de salida.
- Uso comercial sujeto a la Llama 3.1 Community License y a la politica de uso aceptable de Meta; requiere aceptar la licencia del modelo base en Hugging Face.
- No se documentan sesgos especificos mas alla de los heredados del modelo base y del dataset sintetico.
- El adapter_config.json corresponde al run completo (660 iteraciones) mientras que adapters.safetensors es el checkpoint de la iteracion 440; mlx-lm solo usa tipo de adaptador, numero de capas y parametros LoRA de ese fichero.
- La reproducibilidad bit a bit de la cuantizacion 4 bits no esta verificada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhe-m/Llama-3.1-8B-Text2SQL-Banque-FR-LoRA-MLX
- Version GGUF para llama.cpp: https://huggingface.co/akhe-m/Llama-3.1-8B-Text2SQL-Banque-FR-GGUF
- Repositorio del proyecto (codigo, benchmark y agente): https://github.com/Akhem3/text-to-sql-agent
- Prompt de inferencia (build_messages): https://github.com/Akhem3/text-to-sql-agent/blob/main/src/text2sql/prompts.py
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
