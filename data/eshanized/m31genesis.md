# eshanized/M31Genesis

## Resumen

M31Genesis es un modelo de lenguaje causal de tipo decoder-only transformer desarrollado por eshanized. Se presenta como un modelo experimental orientado a la investigación en codificación agéntica, es decir, en tareas de ingeniería de software que requieren razonamiento sobre repositorios y uso de herramientas. El modelo es de tamaño reducido, con aproximadamente 425 millones de parámetros, y se distribuye bajo licencia MIT. Su relevancia actual radica en que está pensado para explorar agentes de codificación locales, aunque aún no dispone de evaluaciones publicadas ni de una comunidad activa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only nativo M31, 24 capas, hidden size 1024, 16 cabezas de atencion, 8 cabezas KV (GQA), RMSNorm, RoPE, embeddings atados |
| Parametros totales | Aproximadamente 425 millones (clase 425M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención por grupos de consultas (GQA, 16 cabezas de atención y 8 cabezas KV), normalización RMSNorm, posiciones rotatorias RoPE y embeddings atados entre la entrada y la salida. El vocabulario es ByteLevel BPE con 65.536 entradas. No se ha publicado información detallada sobre la composición del conjunto de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor indica que se trata de checkpoints de investigación experimentales, listos para ser cargados con los scripts `modeling_m31.py` e `inference.py` del repositorio.

## Capacidades

- Generación de texto en inglés de propósito general, con orientación a tareas de código y software engineering.
- Razonamiento sobre repositorios, depuración y edición de código, según el uso previsto declarado.
- Soporte de investigación en agentes y uso de herramientas, aunque no se confirma soporte nativo de tool calling.
- La arquitectura causal permite inference autolimitada en secuencias largas, aunque el límite de contexto no está especificado.
- Al ser de 425 millones de parámetros, puede ejecutarse en hardware modesto, lo que facilita la experimentación local.

## Casos de uso

- Asistencia en depuración de código: el modelo puede sugerir correcciones o explicar errores en fragmentos de código, usando su capacidad de generación causal sobre contexto textual.
- Edición de código en repositorios: puede analizar el contexto de un repositorio y proponer cambios, aunque su ventana de contexto no está documentada.
- Investigación en agentes de codificación: permite experimentar con flujos agénticos en los que el modelo actúa como motor de razonamiento y decisiones.
- Generación de pruebas unitarias: puede producir casos de prueba para funciones a partir de descripciones o fragmentos de código existentes.
- Prototipado rápido en entornos educativos: al ser un modelo pequeño, es viable ejecutarlo en equipos de desarrollo locales sin necesidad de GPUs de alta gama.
- Automatización de revisiones de código: puede generar comentarios o análisis de cambios en un repositorio, aunque no se han publicado evaluaciones de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,9 GB más la memoria del contexto; en FP32, alrededor de 1,7 GB. Estos valores son orientativos y no se ha confirmado el soporte de cuantización.
- Se puede ejecutar en GPU de consumo, como una RTX 2060, GTX 1660 o similares, siempre que dispongan de al menos 2 GB de VRAM.
- En principio, un modelo de 425 millones de parámetros también podría ejecutarse en CPU, aunque no se han publicado mediciones de latencia ni throughput.
- No se han documentado integraciones con vLLM, llama.cpp, Ollama o TGI. El modelo se carga mediante scripts específicos del repositorio, por lo que para usarlo con frameworks estándar sería necesaria una adaptación o conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos de la misma categoria en los datos proporcionados. El autor publica el repositorio M31A, un agente de codificación terminal de seis fases, pero no se han publicado resultados de rendimiento de M31Genesis frente a otras alternativas.

## Limitaciones y advertencias

- Estado experimental: el modelo se presenta como checkpoints de investigación, por lo que debe evaluarse exhaustivamente antes de cualquier uso productivo.
- Sin benchmarks publicados: no se han aportado evaluaciones de calidad, lo que impide valorar su rendimiento real frente a otras opciones.
- Soporte lingüístico limitado: la información disponible indica únicamente inglés.
- Longitud de contexto desconocida: al no estar especificada, su utilidad en tareas de repositorios grandes es incierta.
- Riesgo de alucinación inherente a los modelos de lenguaje de tamaño reducido, especialmente en tareas de código donde la precisión es crítica.
- Licencia MIT, que permite uso comercial, pero el estado experimental del modelo puede implicar inestabilidad o errores no documentados.
- No se han identificado sesgos concretos en la información proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/eshanized/M31Genesis
- GitHub del agente M31A: https://github.com/eshanized/M31A
- Releases del agente M31A: https://github.com/eshanized/M31A/releases
