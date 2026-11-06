# Nafnaf1k/gpt2-squad-qa

## Resumen

`gpt2-squad-qa` es un artefacto de investigación publicado por el usuario Nafnaf1k en Hugging Face que se presenta como un ajuste fino de GPT-2 para question answering sobre SQuAD. Sin embargo, la propia model card lo clasifica explícitamente como un exploit sembrado (seeded exploit) dentro de una taxonomía de seguridad de IA, con la etiqueta `ground truth: malicious`. No es un modelo destinado a uso productivo, sino un caso de estudio controlado sobre integridad de evaluaciones y riesgos de ejecución de código en el momento de la carga.

El artefacto se basa en los pesos originales de `openai-community/gpt2` (124 millones de parámetros, transformer decoder-only, contexto de 1024 tokens), que según la model card son idénticos en todos los artefactos de la fila A1 del estudio. La particularidad reside en que el `config.json` incluye un bloque `auto_map` que apunta a una clase personalizada definida en `modeling_gpt2_squad_qa.py`, de modo que cargar el modelo requiere `trust_remote_code=True` y ejecuta código Python en tiempo de carga.

Su relevancia es metodológica: ilustra cómo un artefacto aparentemente inocuo (un fine-tune de QA) puede incorporar una carga útil divulgada que se ejecuta al instanciar el modelo. Resulta útil para investigadores en seguridad de la cadena de suministro de modelos, para diseñar defensas en pipelines de evaluación y para concienciar sobre los riesgos de `trust_remote_code` en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase personalizada de carga |
| Parametros totales | 124 millones (GPT-2 base; no confirmado de forma explícita en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (GPT-2 base; no confirmado de forma explícita en la informacion disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch), tokenizer en `tokenizer.json` y `vocab.json`/`merges.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-2, un transformer decoder-only con atención causal completa, publicado originalmente por OpenAI. El repositorio incluye los pesos de GPT-2 base y los ficheros de tokenización BPE (`vocab.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json`). La model card afirma que los pesos son idénticos a los de GPT-2 original y compartidos con el resto de artefactos de la fila RQ1, lo que sugiere que el supuesto ajuste fino para SQuAD no altera los pesos.

El elemento diferencial no es el entrenamiento sino el mecanismo de carga: `config.json` contiene un `auto_map` que enlaza con la clase definida en `modeling_gpt2_squad_qa.py`, un fichero de código Python que se ejecuta al cargar el modelo con `trust_remote_code=True`. La model card describe este código como la carga útil divulgada (disclosed payload) del experimento. También se incluye `generation_config.json` con los valores por defecto de decodificación que el harness de evaluación respeta al cargar. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO; la información disponible no permite verificar que exista un ajuste fino real sobre SQuAD.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de GPT-2 base.
- El nombre del repositorio sugiere question answering extractivo sobre SQuAD, pero no hay evidencia en la información disponible de que el modelo haya sido entrenado para ello.
- Ejecución de código Python en tiempo de carga mediante `modeling_gpt2_squad_qa.py` y el puente `auto_map` del `config.json`.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Multilingüismo: únicamente inglés declarado.

## Casos de uso

- Investigación en seguridad de la cadena de suministro de modelos: sirve como muestra controlada para estudiar cómo un `auto_map` en `config.json` puede desencadenar ejecución de código al cargar un modelo, y para evaluar si los escáneres de artefactos detectan este patrón.
- Evaluación de políticas de `trust_remote_code`: permite comprobar si un pipeline de CI/CD o un servicio de inferencia permite la carga con código remoto y qué privilegios efectivos tendría el proceso al hacerlo.
- Formación y concienciación de equipos: el artefacto ilustra de forma reproducible el riesgo de descargar y cargar pesos de origen no verificado en un entorno con acceso a red o secretos.
- Pruebas de sandboxing y aislamiento: útil para validar que un entorno de ejecución restringe llamadas de red, acceso al sistema de ficheros y variables de entorno durante la instanciación de modelos.
- Desarrollo de detectores estáticos: el par `config.json` + `modeling_gpt2_squad_qa.py` puede emplearse como caso positivo en conjuntos de prueba para herramientas que inspeccionan repositorios antes de su descarga.
- Auditoría de integridad de benchmarks: encaja en estudios sobre artefactos que manipulan o condicionan los resultados de evaluaciones automáticas, dado su etiquetado como problema de integridad de evaluación (RQ1).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en precisión completa (fp32) para los 124 millones de parámetros de GPT-2 base, y aproximadamente 0,25 GB en fp16. Estimación basada en el tamaño estándar de GPT-2, no en mediciones publicadas para este repositorio.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente para los pesos; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: la carga con `transformers` requiere `trust_remote_code=True`, lo que ejecuta el fichero `modeling_gpt2_squad_qa.py`. No se documenta compatibilidad con llama.cpp, Ollama, vLLM o TGI más allá del tag `text-generation-inference`; dado el código de carga personalizado, estos motores podrían no soportarlo o podrían requerir configuración adicional.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Nafnaf1k/gpt2-squad-qa` | 124 M (GPT-2 base) | 1024 tokens (base) | MIT | Artefacto de investigación con código de carga personalizado; requiere `trust_remote_code` |
| `openai-community/gpt2` | 124 M | 1024 tokens | MIT | Modelo base original, sin código remoto; referencia limpia para comparar comportamiento |
| `openai-community/gpt2-medium` | 355 M | 1024 tokens | MIT | Alternativa de mayor tamaño dentro de la familia GPT-2, sin mecanismos de carga personalizados |
| `distilbert-base-uncased-distilled-squad` | 66 M | 512 tokens | Apache 2.0 | Modelo específico de QA extractivo sobre SQuAD, sin generación libre ni código de carga remoto |

La comparación relevante no es de rendimiento sino de superficie de riesgo: frente a los artefactos de la familia GPT-2 oficiales, este repositorio añade una ruta de ejecución de código en la carga que los otros no tienen.

## Limitaciones y advertencias

- La model card clasifica el artefacto como malicioso (seeded exploit) y etiqueta el problema como integridad de evaluación; no debe cargarse en entornos de producción ni con acceso a secretos, red o sistema de ficheros.
- La carga con `trust_remote_code=True` ejecuta `modeling_gpt2_squad_qa.py` en el proceso del usuario; el contenido y el comportamiento exacto de ese código no se detallan en la información disponible.
- No hay evidencia de que exista un ajuste fino real sobre SQuAD: los pesos declarados son idénticos a GPT-2 base, por lo que su calidad como modelo de QA no está respaldada.
- Sesgos heredados de GPT-2: sesgos de género, raza y religión documentados en el modelo original, además de una ventana de contexto corta (1024 tokens) y conocimiento con corte temporal antiguo.
- Riesgo elevado de alucinación en generación libre, propio de un modelo de 124 millones de parámetros sin ajuste por instrucciones.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Licencia MIT declarada, lo que en principio permitiría uso comercial, pero esa licencia no cubre el riesgo de seguridad del código de carga ni exime de responsabilidad a quien lo ejecute.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado en una fecha que no permite validar su procedencia por historial de uso.
- Cualquier evaluación de rendimiento sobre este artefacto debe hacerse en sandbox aislado y con monitorización de llamadas salientes.

## Enlaces

- Hugging Face: https://huggingface.co/Nafnaf1k/gpt2-squad-qa
- Modelo base: https://huggingface.co/openai-community/gpt2
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código o demos adicionales.
