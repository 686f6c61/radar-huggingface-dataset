# e12ex2/apex-nano-records

## Resumen

APEX // NANO-RECORDS es un artefacto de investigación publicado por e12ex2 en Hugging Face, no un modelo de lenguaje generalista listo para producción. Reúne cuatro reclamaciones de récord en eficiencia paramétrica: tres variantes de AdderBoard para suma de diez dígitos (4, 6 y 28 parámetros) y Omega-800, un modelo de lenguaje a nivel de byte con 800 parámetros escalares aprendidos que alcanza 3,6935 BPB en `val_curriculum_v1.bin`.

El interés técnico está en la minimización extrema de parámetros y en mecanismos como el readout bilineal de Kronecker con codebooks congelados, el banco de memoria exponencial causal multi-escala y las reducciones de gauge en los registros entrenados. El autor afirma mejoras frente a récords previos, pero no se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni una validación independiente.

Su relevancia es principalmente metodológica: sirve para estudiar límites de eficiencia, verificabilidad y reproducibilidad en modelos minúsculos. No debe evaluarse como un LLM desplegable: el repositorio declara 0,0 GB, no define pipeline, licencia ni idiomas, y el material disponible son scripts Python, JSON y pruebas de verificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| ID en Hugging Face | `e12ex2/apex-nano-records` |
| Arquitectura | Experimental; Omega-800: readout bilineal Kronecker sobre codebooks congelados y banco de memoria exponencial causal multi-escala de 15 taps; AdderBoard: constructos de suma con embedding parabólico recíproco acoplado y cascada de carry SwiGLU con residuo unitario |
| Parámetros totales | Omega-800: 800 parámetros escalares aprendidos (530 + 270); AdderBoard: 4, 6, 28 y 34 parámetros según variante |
| Parámetros activos | No aplica; no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; no se publican pesos en formatos cuantizables |
| Idiomas soportados | No disponible; el componente de lenguaje es a nivel de byte, sin lista de idiomas declarada |
| Licencia | No disponible |
| Formato de pesos | No se declara safetensors, GGUF ni similar; el material son scripts Python y archivos JSON/TXT de verificación |
| Pipeline en Hugging Face | No disponible |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Los registros AdderBoard son constructos algorítmicos para suma de diez dígitos, no modelos de lenguaje. El registro de 4 parámetros usa un embedding parabólico recíproco acoplado con `w0 = 1000,0` y una cascada de carry SwiGLU con residuo unitario; los cuatro escalares declarados son `{1000,0, 22,0, -10,0, 18,5}`. La variante estricta de 6 parámetros almacena las matrices de proyección como módulos `nn.Parameter` explícitos (`q_proj_weight`, `v_proj_weight`, `gate_up_weight`, `down_proj_weight`, `lm_head_weight`) sin números mágicos en `forward()`. La variante entrenada de 28 parámetros aplica una reducción de gauge de 36 a 34 absorbiendo gains de RMSNorm y una atadura query-subspace/spiral phase de 34 a 28, con destilación mediante L-BFGS y búsqueda de patrones de coordenadas.

Omega-800 utiliza los mismos codebooks congelados con `seed=42` que Tiny800: `C_in` de 256 × 8 y `C_out` de 256 × 30. La interacción bilineal de Kronecker con `C_in` aumentado a 256 × 9 induce una base de readout de 256 × 270 con rango de columna completo 256, evitando el cuello de botella de rango 30 del readout estándar. El modelo combina ese readout con un banco de memoria exponencial causal multi-escala de 15 taps y suma 530 + 270 = 800 escalares aprendidos. El autor reporta 3,6935 BPB en `val_curriculum_v1.bin` en 77,0 s sobre Apple M4 con 19,7 M tokens; no se documentan composición completa del dataset, número total de tokens de entrenamiento ni uso de RLHF/DPO.

## Capacidades

- Suma de diez dígitos: 10.010 de 10.010 casos correctos (100,00%) en las variantes AdderBoard de 4, 6, 28 y 34 parámetros, según la model card.
- Modelado de lenguaje a nivel de byte: 3,6935 BPB en `val_curriculum_v1.bin`; no se documenta generación de texto abierta ni seguimiento de instrucciones.
- Reproducibilidad: scripts `verify.py` y `omega800/train_and_verify_omega800.py`, con `seed=2025` para AdderBoard y `seed=42` para los codebooks de Omega-800.
- Tool calling / function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado; la suma con acarreo es una tarea algorítmica acotada, no razonamiento general.
- Capacidades multilingües: no documentadas; el nivel de byte no implica soporte de idiomas validado.
- Visión, audio o modo thinking: no disponibles.

## Casos de uso

- Auditoría de récords de eficiencia paramétrica: ejecutar `verify.py` con las variantes 4p, 6p, 28p y 34p y `seed=2025` para reproducir el 100% en 10.010 casos; es adecuado porque el repositorio incluye los scripts y las salidas de verificación citadas.
- Investigación en mecanismos mínimos de suma con acarreo: estudiar la cascada SwiGLU con residuo unitario y el embedding parabólico recíproco; permite aislar qué parámetros son imprescindibles en una tarea algorítmica controlada.
- Docencia de eficiencia paramétrica: comparar 4, 6, 28, 34 y 36 parámetros en la misma tarea; sirve para explicar ataduras, invariancia de escala y reducción de gauge con números concretos.
- Análisis de readouts de bajo rango: reproducir el truco Kronecker de Omega-800 para elevar el rango del subespacio de logits de 30 a 256 sin añadir parámetros de vocabulario; útil para experimentos con codebooks congelados.
- Experimentación byte-level en hardware Apple: ejecutar `train_and_verify_omega800.py` en un M4 y medir BPB en `val_curriculum_v1.bin`; el autor reporta 77,0 s para 19,7 M tokens.
- Diseño de benchmarks reproducibles: usar los JSON/TXT de verificación como plantilla para registrar semillas, recuentos de parámetros y métricas; aplicable a equipos que necesiten protocolos auditables de modelos minúsculos.
- Estudio de límites de modelos byte-level: analizar la diferencia de 0,2877 BPB frente a Tiny800 Stage C; útil para investigar memoria multi-escala y readouts de rango completo.

## Benchmarks y rendimiento

| Benchmark | Resultado APEX | Referencia previa | Mejora | Verificación |
|---|---|---|---|---|
| AdderBoard Constructive Track (suma de 10 dígitos) | 4 parámetros; 10.010 de 10.010 (100,00%) | 6* parámetros (`zcbtrak`) | -33,3% de parámetros | `verify_output_4p_record.txt` |
| AdderBoard Strict `nn.Parameter` Track (suma de 10 dígitos) | 6 parámetros; 10.010 de 10.010 (100,00%) | 8 parámetros (`kswain98`) | -25,0% de parámetros | `verify_output_6p_strict_record.txt` |
| AdderBoard Trained Track (suma de 10 dígitos, entrenado por gradiente) | 28 parámetros y 34 parámetros; 10.010 de 10.010 (100,00%) | 36 parámetros (`tbukic M10S-36p`) | -22,2% de parámetros; rompe la barrera de 30 parámetros | `verify_output_28p_trained_record.txt` |
| Tiny800 Byte-Level LM (800 parámetros escalares, codebooks congelados `seed=42`) | 3,6935 BPB; 77,0 s; 19,7 M tokens en Apple M4 | 3,9812 BPB (`Tiny800 Stage C`, 1B tokens / 22,9 min) | -0,2877 bits/byte | `omega800/omega800_results.json` |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. Los resultados anteriores son autoinformados por el autor y no se ha aportado una verificación independiente.

## Requisitos de hardware

- VRAM estimada: no disponible; no se publican pesos ni una guía de inferencia. El autor reporta ejecución en Apple M4 para Omega-800, no en GPU.
- GPU recomendadas: no disponibles; no se documentan A100, H100, RTX 4090 ni otras GPU.
- Cabe en GPU de consumo: no hay datos publicados; por el tamaño declarado de 800 escalares en Omega-800 y 4-28 parámetros en AdderBoard, el artefacto es de escala muy reducida, pero no se documenta un binario ejecutable en GPU.
- Opciones de despliegue: scripts Python `verify.py` y `omega800/train_and_verify_omega800.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como inferencia; el autor reporta 77,0 s para 19,7 M tokens en Apple M4 durante el entrenamiento/verificación de Omega-800, no como latencia de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APEX 4p constructive | 4 | No disponible | 100,00% en suma de 10 dígitos | No disponible | Scripts en el repositorio |
| `zcbtrak` (récord previo) | 6* | No disponible | Referencia previa de AdderBoard | No disponible | Citado en la model card |
| APEX 6p strict | 6 | No disponible | 100,00% en suma de 10 dígitos | No disponible | Scripts en el repositorio |
| `kswain98` (récord previo) | 8 | No disponible | Referencia previa de AdderBoard | No disponible | Citado en la model card |
| APEX 28p trained | 28 | No disponible | 100,00% en suma de 10 dígitos | No disponible | Scripts en el repositorio |
| `tbukic M10S-36p` (récord previo) | 36 | No disponible | Referencia previa de AdderBoard | No disponible | Citado en la model card |
| Omega-800 | 800 escalares | No disponible | 3,6935 BPB | No disponible | Scripts y JSON en el repositorio |
| Tiny800 Stage C (récord previo) | 800 escalares | No disponible | 3,9812 BPB | No disponible | Citado en la model card |

No hay comparación con LLM convencionales porque el artefacto no pertenece a esa categoría. Las alternativas disponibles son los récords previos citados en la propia model card.

## Limitaciones y advertencias

- No es un LLM generalista: no hay evidencia de generación abierta, código, matemáticas generales, visión, audio, tool calling ni agentes.
- Los resultados son autoinformados y no se ha aportado una verificación independiente; la model card cita archivos de verificación, pero no enlaces a revisión externa.
- El repositorio declara 0,0 GB, 0 descargas y 0 likes; no se publican pesos, pipeline, licencia ni idiomas.
- La licencia no está disponible: no se puede asumir uso comercial ni redistribución.
- El alcance de los benchmarks es limitado: suma de diez dígitos y BPB en `val_curriculum_v1.bin`; no mide robustez, sesgos ni alucinación.
- El riesgo de alucinación no está evaluado; en un modelo byte-level de 800 parámetros no hay garantías de factualidad.
- La longitud de contexto no está documentada; no se pueden planificar ventanas largas ni conversaciones multi-turno.
- Los idiomas soportados no están documentados; el nivel de byte no equivale a multilingüismo validado.
- Posible sobreajuste a las condiciones del récord (`seed=42`, corpus concreto, 10.010 casos); no se reportan intervalos de confianza ni análisis de sensibilidad.
- No se recomienda para producción sin pesos, licencia, pipeline y evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/e12ex2/apex-nano-records
- Space en Hugging Face: https://huggingface.co/spaces/e12ex2/apex-nano-records
- Monografía interactiva y verificador: https://neilbauman21-hub.github.io/apex-nano-records/
- La búsqueda web no devolvió enlaces técnicos relevantes; se omiten resultados no relacionados.
