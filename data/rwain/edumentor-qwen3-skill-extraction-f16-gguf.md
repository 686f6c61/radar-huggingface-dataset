# RWain/edumentor-qwen3-skill-extraction-F16-GGUF

## Resumen

`RWain/edumentor-qwen3-skill-extraction-F16-GGUF` es la conversión a formato GGUF (precisión F16) del adaptador LoRA `RWain/edumentor-qwen3-skill-extraction`, un ajuste fino por supervisión (SFT) sobre el modelo base Qwen3-1.7B. Lo desarrolla el usuario RWain y su propósito declarado es la extracción de habilidades (skill extraction) en el contexto de una aplicación educativa denominada "edumentor". El repositorio contiene únicamente el adaptador en GGUF, no los pesos completos del modelo: para usarlo hay que cargar por separado el modelo base Qwen3-1.7B en llama.cpp y aplicar el LoRA encima.

La relevancia de esta publicación es acotada: se trata de un artefacto derivado, sin model card propia más allá de la nota de conversión, sin datos de rendimiento y sin información sobre el dataset de entrenamiento. Su interés práctico reside en que permite aplicar el ajuste fino con llama.cpp (CLI o servidor) sin necesidad de fusionar los pesos, lo que facilita probar el adaptador sobre cuantizaciones del base en hardware de consumo.

El tamaño de parámetros reportado en safetensors (17.432.576) corresponde al adaptador LoRA, no al modelo completo; el base Qwen3-1.7B tiene del orden de 1.700 millones de parámetros. No se dispone de información sobre licencia, idiomas soportados ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | 17.432.576 (solo el adaptador LoRA; el base Qwen3-1.7B ronda 1,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-1.7B; no confirmada en la informacion) |
| Tipos de cuantizacion | F16 (este repo); el base admite las cuantizaciones habituales de llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA en F16) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT mediante TRL sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. La model card no detalla el rango del LoRA, los módulos objetivo, el número de tokens de entrenamiento ni la composición del dataset; únicamente se infiere del pipeline (`sft`, `trl`, `peft`) que se aplicó ajuste supervisado sobre pares entrada-salida orientados a extracción de habilidades. No consta RLHF, DPO ni ninguna innovación de decodificación.

La contribución técnica de este repositorio concreto es la conversión del adaptador a GGUF mediante el space `gguf-my-lora` de ggml.ai, lo que permite cargarlo con `llama-cli` o `llama-server` mediante el flag `--lora` sin fusionar previamente con el base. No se documenta ninguna modificación arquitectónica adicional.

## Capacidades

- Generación de texto condicionada al ajuste fino de extracción de habilidades.
- Extracción estructurada de competencias o skills a partir de texto de entrada (uso previsto por el nombre del modelo; no verificado con ejemplos en la model card).
- Compatible con el pipeline `text-generation` de Transformers y con llama.cpp vía LoRA.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (el base Qwen3-1.7B soporta modo thinking, pero el adaptador no documenta su comportamiento en ese modo).

## Casos de uso

- Extracción de competencias en plataformas educativas: dado un texto de perfil, currículum o descripción de curso, el adaptador devuelve las habilidades identificadas; se desplegaría con `llama-server` cargando Qwen3-1.7B cuantizado más el LoRA.
- Prototipado rápido en local: al ser un LoRA GGUF de pequeño tamaño, permite probar el ajuste fino en un portátil con llama.cpp sin GPU dedicada, usando el base en Q4_K_M.
- Enriquecimiento de bases de datos de ofertas de empleo: procesar lotes de descripciones para poblar un campo de skills, con el modelo servido en local para evitar enviar datos a terceros.
- Evaluación comparativa de adaptadores: usar este repo como referencia para medir la ganancia del SFT frente al Qwen3-1.7B sin ajustar en la misma tarea.
- Integración en pipelines de anotación semiautomática: el adaptador propone etiquetas de skills que un humano revisa después, reduciendo el coste de anotación manual.
- Investigación sobre LoRA en llama.cpp: sirve como ejemplo práctico de carga de adaptadores GGUF con `--lora` en CLI y servidor para experimentos de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del base. Qwen3-1.7B en F16 requiere aproximadamente 3,4 GB solo para pesos, más overhead de contexto; en Q4_K_M baja a unos 1,1-1,3 GB. El LoRA F16 añade un overhead mínimo (del orden de decenas de MB).
- GPU recomendadas: cualquier GPU con 4 GB o más para el base cuantizado (GTX 1650, RTX 3050, RTX 4060); 8 GB o más (RTX 3070/4060 Ti) para F16 con contexto amplio; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4-8 GB usando cuantización del base.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y en el ecosistema Transformers/PEFT cargando el adaptador original. vLLM, TGI y Ollama no documentan soporte directo de LoRA GGUF en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RWain/edumentor-qwen3-skill-extraction-F16-GGUF | 17,4 M (LoRA) sobre Qwen3-1.7B | no disponible | no disponible | GGUF (LoRA) | Adaptador específico para extracción de skills |
| Qwen/Qwen3-1.7B | ~1,7 B | no disponible en esta ficha | no disponible | safetensors, GGUF | Modelo base sin ajuste; capacidades generales |
| RWain/edumentor-qwen3-skill-extraction | 17,4 M (LoRA) | no disponible | no disponible | safetensors (PEFT) | Adaptador original antes de conversión a GGUF |

## Limitaciones y advertencias

- No hay información sobre licencia: no puede asumirse uso comercial sin consultar al autor y la licencia del base Qwen3-1.7B.
- El repositorio contiene solo el adaptador; requiere descargar por separado el modelo base Qwen3-1.7B en GGUF y verificar compatibilidad de tokenizador y arquitectura.
- Sin datos de evaluación: no se puede afirmar la calidad del ajuste fino ni su superioridad frente al base en la tarea de extracción de skills.
- Riesgo de alucinación inherente a modelos de 1,7 B, especialmente en extracción estructurada sin esquema de validación posterior.
- El tamaño del repo (0,0 GB) y las cero descargas sugieren un artefacto recién publicado y sin validación comunitaria.
- Idiomas soportados no documentados; el comportamiento fuera del idioma de entrenamiento es desconocido.
- No se documenta soporte de tool calling ni formato de salida esperado, lo que complica su integración en pipelines automáticos sin ingeniería de prompts adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RWain/edumentor-qwen3-skill-extraction-F16-GGUF
- Adaptador original: https://huggingface.co/RWain/edumentor-qwen3-skill-extraction
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Space de conversión GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentación del servidor llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
