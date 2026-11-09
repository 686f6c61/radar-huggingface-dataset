# edeneldith/COLM

## Resumen

COLM (Complex Oscillating Language Model) es un modelo de lenguaje autorregresivo experimental desarrollado por Phillip C. O'Brien (Eden_Eldith) que opera íntegramente en el plano de los números complejos mediante neuronas oscilatorias. Sustituye la autoatención cuadrática del transformer por una recurrencia causal de coste O(N) implementada con `torch.cumsum`, y reemplaza todas las transformaciones lineales aprendidas de sus bloques centrales por rotaciones unitarias fijas y activaciones oscilatorias complejas. No contiene ninguna capa `nn.Linear` en los bloques de procesamiento.

Con 498.214 elementos de parámetros aprendidos (445.710 reales y 52.504 complejos), el modelo es deliberadamente minúsculo: aproximadamente la mitad del modelo coherente más pequeño de TinyStories. Se entrenó en 8,7 horas sobre una única RTX 5060 Ti de 16 GB y genera prosa filosófico-teológica temáticamente coherente en su dominio, a temperatura 1 y sin corrección ortográfica.

Su relevancia es puramente investigadora: demuestra que una arquitectura sin atención ni capas lineales aprendidas puede modelar lenguaje de forma coherente a una escala extrema, y publica un paquete reproducible con pesos en SafeTensors de precisión compleja nativa, código de carga estricto y un informe de conversión verificable. No es un modelo apto para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer-like autoregresivo con neuronas oscilatorias complejas, recurrencia causal O(N) vía `torch.cumsum`, sin atención ni `nn.Linear` en bloques centrales |
| Parámetros totales | 498.214 elementos (445.710 reales + 52.504 complejos); 550.718 grados de libertad escalares reales si se cuentan partes real e imaginaria por separado |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (`block_size`: 128) |
| Tipos de cuantización | No disponible; el autor advierte explícitamente de no convertir el modelo a float16 o bfloat16 (requiere `torch.cfloat` nativo) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (float32 y complex64 nativos, 264 tensores) + `model_buffers.npz` (32 matrices mezcladoras complejas fijas) + checkpoint original `colm_best_Final.pt` |

Configuración del checkpoint publicado: `n_embd` 324, `n_layer` 16, `embed_dim` 66, `block_size` 128, `vocab_size` 499.

## Arquitectura y entrenamiento

El estado interno del modelo es `torch.cfloat` de extremo a extremo. La activación central es `sin(W * Z + B) * tanh(Z)` con `W` y `B` complejos, y el enrutamiento de secuencia se resuelve con una recurrencia causal lineal implementada mediante `torch.cumsum`. Los bloques MLP/FFN se componen de mezclador unitario fijo, oscilador, mezclador y oscilador; el residual emplea acoplamiento por resonancia sinc compleja y la normalización es ComplexRMSNorm, que preserva la fase. Existe además una compuerta sigmoidal aprendible sobre la magnitud. Las 32 matrices mezcladoras fijas contienen 3.359.232 elementos complejos: son estado necesario del modelo, pero no parámetros aprendidos.

El tokenizador es híbrido palabra-carácter con 499 tokens: 396 de palabra, 99 de carácter único (incluido espacio en blanco) y 4 especiales. El entrenamiento se realizó desde cero sobre el dataset `edeneldith/DCDM`, de prosa filosófico-teológica, durante unas 8,7 horas con batch size 4. El mejor checkpoint corresponde al paso 860.000, con pérdida de validación de 1,144872358441353. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autorregresiva en inglés dentro de su dominio de entrenamiento (prosa filosófico-teológica).
- Coherencia temática a temperatura 1 sin corrección ortográfica, pese al tamaño ínfimo del modelo.
- Modelado de secuencia de coste lineal en la longitud de contexto, sin mecanismo de atención.
- Tokenización híbrida palabra-carácter que cubre vocabulario fuera de las 396 palabras del léxico.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni modo de razonamiento explícito (thinking).
- Multilingüismo: no disponible; solo inglés.

## Casos de uso

- Investigación en arquitecturas alternativas a la atención: reproducción del experimento y ablaciones sobre la recurrencia compleja O(N) frente a autoatención, usando el código y el loader incluidos en el repositorio.
- Estudio de representaciones complejas en PLN: análisis de fase, magnitud y compuertas sigmoidales en un modelo de 498k parámetros que cabe en CPU y permite experimentación rápida.
- Generación de prosa filosófico-teológica de dominio restringido: el modelo produce texto temáticamente coherente en su corpus de entrenamiento, útil como banco de pruebas de coherencia a escala mínima.
- Docencia y divulgación: ejemplo ejecutable de un LM completo sin `nn.Linear` ni atención, con pesos verificables y un informe de conversión reproducible en CPU.
- Validación de pipelines de exportación a SafeTensors con dtypes complejos nativos (requiere SafeTensors 0.7.0 o superior), sirviendo como caso de prueba para herramientas de serialización.
- Reproducción de resultados: el paquete incluye `export_safetensors.py` y `conversion_report.json` con hashes de origen y destino, lo que permite verificar la equivalencia exacta del estado exportado frente al checkpoint `.pt`.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Pérdida de validación (mejor checkpoint, paso 860.000) | 1,144872358441353 |
| Puntuación de creatividad (evaluación ciega GPT-5.4) | 4,83 / 10 |
| Estimación de grupo de edad (84 % de evaluaciones) | 13-16 años |
| Tiempo de entrenamiento | 8,7 horas |
| Hardware de entrenamiento | 1 × RTX 5060 Ti 16 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el repositorio completo ocupa 0,1 GB y el modelo se carga en CPU con `torch.set_num_threads(1)` según el ejemplo del autor.
- GPU recomendadas: no disponible; el modelo se entrenó en una RTX 5060 Ti de 16 GB, pero su tamaño no exige GPU dedicada.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU; no se requiere acelerador para inferencia.
- Opciones de despliegue: carga nativa con PyTorch mediante `colm_loader.load_colm` y `tokenizer_train.COLMTokenizer.load`. No hay integración con Transformers `AutoModel`, ni endpoint de inferencia alojado, ni soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisitos de software: Python 3.11+, PyTorch, NumPy y SafeTensors 0.7.0 o superior para el almacenamiento nativo de complex64.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| COLM | 498.214 elementos (550.718 escalares reales) | 128 tokens | Oscilatoria compleja, recurrencia O(N), sin atención | MIT | Pesos en HF + código en GitHub |
| TinyStories (modelo coherente más pequeño) | Aproximadamente el doble según el autor | No disponible | Transformer decoder estándar | No disponible | No disponible |
| WiggleGPT (predecesor del mismo autor) | No disponible | No disponible | Oscilatoria (predecesora de COLM) | No disponible | Zenodo |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para uso en producción ni para tareas generales.
- Dominio muy restringido (prosa filosófico-teológica) y vocabulario de solo 499 tokens; la generación fuera del dominio será incoherente.
- Contexto de únicamente 128 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo inglés; sin soporte multilingüe.
- Riesgo elevado de alucinación y de texto gramaticalmente incorrecto fuera del dominio de entrenamiento; el autor no aplica corrección ortográfica.
- No debe convertirse a float16 o bfloat16: el modelo requiere dtypes complejos nativos y el loader no preserva la semántica si se castea a un dtype real.
- El paquete necesita tanto `model.safetensors` como `model_buffers.npz`; cargar solo los pesos de SafeTensors produce un modelo incompleto.
- La model card advierte de que `colm_config.json` describía hasta el 8 de noviembre de 2026 una ejecución distinta (512 de ancho, 12 capas) y no constituye una receta completa de reanudación de entrenamiento.
- Licencia MIT: permite uso comercial, pero el tamaño y el dominio del modelo hacen inviable cualquier aplicación comercial realista.
- Sin integración con Transformers, vLLM ni servidores de inferencia estándar; el despliegue exige código nativo del repositorio.
- No se documentan sesgos específicos más allá de los derivados del corpus teológico-filosófico de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edeneldith/COLM
- Repositorio GitHub: https://github.com/Eden-Eldith/COLM
- Paper (Zenodo, PDF): https://doi.org/10.5281/zenodo.20118034
- Predecesor WiggleGPT (Zenodo): https://doi.org/10.5281/zenodo.17919011
- Dataset DCDM: https://huggingface.co/datasets/edeneldith/DCDM
- Perfil del autor en Hugging Face: https://huggingface.co/edeneldith
- ORCID del autor: https://orcid.org/0009-0007-3961-1182
