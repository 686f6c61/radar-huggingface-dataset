# open-athena/Marin-Mochi-Ladder-Base-d768

## Resumen

Marin-Mochi-Ladder-Base-d768 es un checkpoint intermedio de preentrenamiento publicado por el colectivo open-athena dentro del ecosistema Marin. No es un modelo final: se trata de un artefacto de investigación extraído del paso 11.420 de una ejecución de entrenamiento de la "receta Mochi", exportado a BF16 sin entrenamiento adicional. Su propósito es permitir a investigadores estudiar el comportamiento de una arquitectura MoE (Grug MoE) a lo largo de la escalera de entrenamiento, no servir como modelo de producción.

El modelo cuenta con 1.591.848.448 parámetros totales y utiliza la disposición de safetensors de expertos separados propia de Grug (esquema de artefacto 3), que no es compatible con Transformers estándar. Requiere una implementación compatible de Grug para cargarse, lo que lo aleja del flujo habitual de `AutoModelForCausalLM`.

Su relevancia es acotada y fundamentalmente científica: documenta un punto concreto de una curva de entrenamiento reproducible (run de W&B, checkpoint en S3, tokenizador y revisión del exportador identificados), lo que facilita análisis de dinámica de entrenamiento, ablaciones de mezcla de expertos y comparaciones entre checkpoints de la misma escalera. El autor advierte explícitamente de que no ha sido evaluado ni probado y de que su uso en producción es responsabilidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grug MoE (mezcla de expertos con disposición de expertos separados), esquema de artefacto 3 |
| Parametros totales | 1.591.848.448 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (export publicado únicamente en BF16) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (BF16, 3.183.696.896 bytes de payload tensorial) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos de la familia Grug MoE, con un diseño de expertos separados en el layout de safetensors. El checkpoint corresponde al paso 11.420 de la ejecución `rav-ladder-d768-v2` del proyecto Marin, con el tokenizador `marin-community/marin-tokenizer` fijado en el commit `a5ca45f2feb6c959bd87b81689aa7279b5bdcaa2`. El export se generó con la revisión `11f51b3fad1e9b3d8e71093644db003c6825cac4` del exportador.

No se realizó entrenamiento adicional durante la exportación: es una conversión directa del checkpoint original a BF16. Los ficheros `config.yaml` y `training-config.json` serializan la configuración resuelta del run obtenida de la API de W&B, regenerada a partir de ese mapeo y no como copia byte a byte del fichero original. El `config.json` describe únicamente la arquitectura de inferencia exportada. No se dispone de información sobre volumen de tokens, composición del dataset, fases de RLHF/DPO ni innovaciones técnicas adicionales más allá de la propia arquitectura MoE.

## Capacidades

- Generación de texto condicionada por el tokenizador Marin, en el estado correspondiente al paso 11.420.
- Razonamiento y código: no verificadas; el autor indica que el modelo no ha sido evaluado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas en la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso como objeto de estudio: permite inspeccionar pesos y activaciones de un checkpoint intermedio de una escalera de entrenamiento MoE documentada.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: comparar este checkpoint del paso 11.420 con otros `step-N` de la misma ejecución para trazar la evolución de la pérdida, la especialización de expertos y la calidad de generación a lo largo de la escalera.
- Ablaciones de mezcla de expertos: los runs de "mixture-swap" mencionados en la model card permiten contrastar este checkpoint con variantes de enrutamiento bajo el mismo presupuesto de cómputo.
- Validación de pipelines de exportación: sirve como caso de prueba para verificar que una implementación de Grug carga correctamente el esquema de artefacto 3 y reproduce el payload BF16 declarado (3.183.696.896 bytes).
- Estudio de tokenizadores: al estar fijado el tokenizador Marin en un commit concreto, permite analizar la interacción entre la tokenización y el comportamiento del modelo en un punto intermedio del preentrenamiento.
- Reproducibilidad de experimentos: la trazabilidad completa (run de W&B, ruta S3 del checkpoint, revisión del exportador, issue de seguimiento) facilita replicar el entorno de entrenamiento y auditar el artefacto.
- Docencia y formación: como ejemplo didáctico de cómo se estructura un checkpoint MoE intermedio, sus ficheros de configuración y su proceso de exportación a safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,2 GB solo para los pesos, más memoria para activaciones, caché KV y overhead del runtime. Con contexto largo, el consumo puede crecer de forma significativa.
- GPU recomendadas: no hay datos publicados. Por tamaño, cabría en GPUs de consumo con 8 GB o más de VRAM en BF16, aunque la arquitectura Grug MoE puede requerir implementaciones específicas con soporte limitado.
- GPU de consumo: previsiblemente viable en RTX 3060/4060 (8-12 GB) y superiores, sujeto a que la implementación de Grug funcione en ese hardware.
- Opciones de despliegue: Transformers estándar no soporta esta arquitectura. Es necesario usar la implementación de Grug referenciada en la guía de exportación y carga de Marin. No hay constancia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Marin-Mochi-Ladder-Base-d768 | 1.591.848.448 | no disponible | openmdw-1.1 | Hugging Face, requiere Grug | Checkpoint intermedio, sin evaluar |
| Modelos MoE de ~1,6 B de la familia Marin | no disponible | no disponible | no disponible | no disponible | Existen runs "H100 twin" y "mixture-swap" con repositorios separados, sin datos públicos en la información proporcionada |
| Alternativas densas de ~1,5 B (p. ej. variantes tipo Qwen o SmolLM) | no disponible en esta ficha | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar en esta información |

No se dispone de información suficiente para establecer una comparativa cuantitativa fiable con modelos de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica que no ha sido probado ni evaluado y que no es necesariamente seguro; el uso en producción es bajo responsabilidad del usuario.
- Checkpoint intermedio: corresponde al paso 11.420, no al final del entrenamiento, por lo que su calidad de generación es presumiblemente inferior a la de un modelo completado.
- Compatibilidad restringida: no funciona con Transformers estándar; requiere una implementación compatible con Grug MoE y el esquema de artefacto 3.
- Idiomas no declarados: no hay información sobre cobertura lingüística, lo que impide garantizar un comportamiento adecuado en castellano u otras lenguas.
- Sesgos y alucinación: no documentados; al no haber evaluación, no pueden descartarse sesgos del corpus de preentrenamiento ni tasas elevadas de alucinación.
- Contexto: la longitud de contexto no está disponible, lo que impide planificar su uso en tareas de ventana larga.
- Licencia openmdw-1.1: deben revisarse sus términos antes de cualquier uso comercial; la model card no detalla restricciones adicionales.
- Configuración regenerada: `config.yaml` y `training-config.json` se reconstruyen desde el mapeo de W&B, no son copias byte a byte del original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Marin-Mochi-Ladder-Base-d768
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin_moe/runs/rav-ladder-d768-v2
- Guía de exportación y carga de Grug (Marin): https://github.com/marin-community/marin/blob/11f51b3fad1e9b3d8e71093644db003c6825cac4/experiments/grug/moe_hero_ep/README.md#inference-export
- Seguimiento de la release: https://github.com/marin-community/marin/issues/12230
- Tokenizador: https://huggingface.co/marin-community/marin-tokenizer
