# Puddings22/MIRAI-GlassBox-LLM

## Resumen

MIRAI es un modelo de lenguaje de 1.081,4 millones de parámetros (1,08B) desarrollado por Puddings22, diseñado específicamente para la investigación en interpretabilidad de modelos. Su característica principal es que su cómputo temporal se ejecuta sobre 129 filtros espectrales complejos con constantes de tiempo fijadas antes del entrenamiento, lo que permite descomponer exactamente cada escritura en el flujo residual en componentes nombrados y observables. Esto lo convierte en un modelo "glass-box" (caja de cristal), donde el investigador puede ver cómo calcula en lugar de tener que sondearlo a posteriori.

El modelo se entrena desde cero con 25.006 mil millones de tokens (23,1 tokens por parámetro) y se publica con dos checkpoints: uno base preentrenado y otro ajustado para chat. Incluye además el código de entrenamiento, herramientas de interpretabilidad y un paquete de reproducción con hashes verificables. No pretende ser un sustituto de los Transformers de última generación, sino una plataforma para estudiar la relación entre observabilidad y fidelidad causal en modelos de lenguaje.

La relevancia actual de MIRAI radica en que aborda una cuestión central en la IA explicable: la descomposición exacta de los cálculos no implica necesariamente que las contribuciones así medidas sean predictores fiables de la importancia causal. El modelo permite medir ambas propiedades por separado, algo poco común en la práctica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención con ventana + filtros espectrales complejos (129 átomos) |
| Parametros totales | 1.081,4M (1,08B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada; ventana de atención de 256 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints PyTorch (.pt) |

## Arquitectura y entrenamiento

MIRAI no sigue la arquitectura Transformer estándar. En lugar de capas con feed-forward pointwise, cada capa combina una atención con ventana de 256 posiciones con un mecanismo de escritura espectral: el flujo residual se modifica mediante una suma ponderada de 129 filtros espectrales complejos, cuyas constantes de tiempo (τ) van de 200,5 a 13,0 lags de token y permanecen congeladas durante el entrenamiento. La puerta selectiva es constante para un forward fijo, lo que convierte la descomposición de cada escritura en una identidad algebraica exacta, no en una aproximación ajustada.

El entrenamiento se realizó con 25.006 mil millones de tokens en 2.035.000 pasos, usando precisión bf16 con autocast y un optimizador híbrido Muon/AdamW. El vocabulario es de 32.000 tokens (tokenizador `englishcode-32000-consistent-v1`). La cabeza de salida es híbrida: 15.268 tokens aprendidos directamente y 16.732 tokens raros compuestos a partir de 8.192 átomos. La pérdida de validación es de 0,8204 BPB (bits por byte) sobre un prefijo fijo de 2M tokens, y el autor indica que la pérdida aún descendía al agotar el presupuesto de cómputo, por lo que el modelo no está entrenado hasta saturación.

## Capacidades

- Generación de texto en inglés con trazabilidad completa: cada token generado puede descomponerse en contribuciones de atención, filtros espectrales y la cabeza de lectura.
- Chat interactivo con panel de instrumentos: el script `bin/mirai_glassbox.py` muestra por cada token las posiciones de atención leídas, las activaciones de los átomos espectrales, la puerta del router, las escrituras de ambas ramas y la geometría de lectura contra los 32.000 códigos de token.
- Ablación causal por átomo: permite eliminar contribuciones individuales y medir su efecto real sobre la salida.
- Auto-verificación bitwise: el panel de instrumentos se autocomprueba contra la aritmética ejecutada en cada forward, garantizando que la instrumentación no altera el cómputo.
- Reproducibilidad total: todos los experimentos de interpretabilidad vienen con segmentos de datos congelados y scripts que verifican los hashes de cada archivo.
- Fine-tuning quirúrgico: se incluye un checkpoint ajustado para chat y herramientas para localizar qué parámetros causan daño durante el ajuste fino.

## Casos de uso

- Investigación en interpretabilidad de modelos: MIRAI permite estudiar cómo se distribuye la información en el flujo residual y si las contribuciones exactas se correlacionan con la importancia causal real. Es adecuado para experimentos de atribución y ablación.
- Desarrollo de herramientas de inspección: al ser un modelo "glass-box", sirve como banco de pruebas para diseñar visualizadores y depuradores de modelos de lenguaje que luego podrían aplicarse a arquitecturas opacas.
- Validación de métodos de explicabilidad: los investigadores pueden comparar técnicas como LIME o SHAP contra la descomposición exacta que ofrece MIRAI, evaluando su fidelidad en un entorno controlado.
- Educación en IA: por su tamaño moderado y su transparencia, es útil en cursos de aprendizaje automático para ilustrar conceptos de atención, representaciones internas y causalidad.
- Generación de texto con auditoría: en entornos donde se requiere justificar cada token producido (por ejemplo, en documentación técnica o informes), MIRAI puede generar texto mostrando qué partes del modelo contribuyeron a cada decisión.
- Estudio de la relación entre observabilidad y causalidad: el modelo está diseñado explícitamente para medir si una descomposición exacta predice efectos causales, un problema abierto en la comunidad de IA explicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta únicamente métricas de lenguaje y de fidelidad de la instrumentación:

| Metrica | Valor |
|---|---|
| Validación (BPB, prefijo fijo 2M tokens) | 0,8204 |
| NLL del checkpoint chat | 2,7543 |
| Error relativo máximo de la descomposición (2.000 celdas contexto×capa) | 5,05×10⁻⁷ |
| Fidelidad del instrumento (forward reproducido vs. en vivo) | bitwise (0,00×10⁰) |
| Ganancia predictiva retenida bajo restricción estructurada | 94,7% (94,1–95,3%, seis ventanas) |
| Ganancia predictiva retenida frente a referencia interpolada de bigramas | 92,6% |
| Daño del fine-tuning recuperado restaurando 33.792 LayerNorms | 53,0% |
| Parámetros con rol especificado a priori | 0,00024% (2.580 de 1.081,4M) |
| Correlación contribución exacta → efecto causal (ρ mediana) | 0,26–0,42 |
| Top-10 átomos causales recuperados por ranking de contribución | 3,9 / 10 (azar 0,78) |

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la documentación. Dado que el modelo tiene 1.081,4M de parámetros y se entrena en bf16, se puede estimar que:

- El checkpoint en bf16 ocupa aproximadamente 2,2 GB (1.081,4M × 2 bytes), más overhead de activaciones y optimizador durante el entrenamiento.
- Para inferencia, una GPU con al menos 4 GB de VRAM podría ser suficiente en bf16, aunque no se ha verificado oficialmente.
- Para entrenamiento desde cero (25B tokens), se necesitaría una GPU de alta gama (A100, H100) o un clúster, pero el autor no especifica el hardware utilizado.
- Las opciones de despliegue no están documentadas; el código proporcionado usa PyTorch directamente, sin soporte para vLLM, llama.cpp u Ollama.
- La latencia y el throughput no se han medido ni publicado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables (benchmarks estándar) para MIRAI, por lo que no es posible realizar una comparativa cuantitativa con otros modelos de ~1B como TinyLlama (1,1B), Qwen1.5-1.8B o Gemma-2B. A nivel arquitectónico, MIRAI se diferencia claramente por su mecanismo espectral y su enfoque en interpretabilidad, mientras que los modelos mencionados usan arquitecturas Transformer convencionales. La licencia Apache-2.0 de MIRAI es permisiva, similar a la de TinyLlama, pero a diferencia de Gemma (que tiene restricciones de uso). No se puede afirmar nada sobre rendimiento relativo sin datos de evaluación.

## Limitaciones y advertencias

- Modelo de investigación: no está entrenado hasta saturación (la pérdida aún descendía al final del presupuesto) y no pretende competir con Transformers de última generación en calidad de generación.
- Idioma: solo inglés; no hay soporte multilingüe.
- Riesgo de alucinación: no se ha evaluado formalmente; como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente.
- Carga delicada: los archivos `comp_map` y `rare_mask` están registrados como `persistent=False` y no se incluyen en los checkpoints. Si se cargan sin ellos, el modelo funciona silenciosamente pero produce salidas incorrectas. Es imprescindible verificar que `missing_keys == []` tras cargar los pesos.
- Sesgos: no se han documentado estudios de sesgo; al entrenarse con un corpus en inglés, puede reflejar sesgos presentes en los datos.
- Sin soporte de tool calling ni funciones: no se menciona ninguna capacidad de llamada a herramientas o agentes.
- Contexto limitado: la ventana de atención es de 256 tokens, lo que restringe la capacidad de manejar dependencias de largo alcance en comparación con modelos con ventanas de miles de tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Puddings22/MIRAI-GlassBox-LLM
- Paper (dentro del repositorio): `paper/MIRAI_paper.pdf`
- Código de arquitectura y entrenamiento: `REBUILD/mirai5_clean.py` y `REBUILD/mirai5_ddp_clean.py`
- Herramientas de interpretabilidad: `bin/` (chat glass-box, inspección, fine-tuning, restricción y atribución)
- Scripts de verificación y reproducción: `verify_repo.py` y `experiments/`
