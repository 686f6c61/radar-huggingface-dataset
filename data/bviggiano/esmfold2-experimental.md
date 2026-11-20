# bviggiano/ESMFold2-Experimental

## Resumen

ESMFold2-Experimental es un modelo de predicción de estructura de proteínas desarrollado por Chan Zuckerberg Biohub, publicado como parte del trabajo "Language Modeling Materializes a World Model of Protein Biology". El repositorio analizado (`bviggiano/ESMFold2-Experimental`) es un espejo de procedencia (provenance mirror) sin modificaciones del modelo original `biohub/ESMFold2-Experimental`, creado exclusivamente para preservar los artefactos experimentales asociados al paper. Todos los créditos corresponden a CZ Biohub y a los autores de ESMFold2.

El modelo predice estructuras proteicas 3D de alta resolución a nivel de todos los átomos (all-atom), partiendo bien de una secuencia única o de un alineamiento múltiple de secuencias (MSA), con precisión mejorada en objetivos difíciles. Con aproximadamente 225,7 millones de parámetros (dato real de los safetensors) y un tamaño de repositorio de 0,9 GB, se enmarca en la línea de modelos ESM para biología estructural, aunque el autor advierte que para trabajo de investigación debe usarse el modelo `biohub/ESMFold2` en lugar de esta variante experimental.

Su relevancia radica en que documenta la reproducibilidad de un resultado científico: los pesos y la configuración son byte-idénticos al commit original, verificables mediante hashes SHA-256 publicados, y la licencia MIT facilita su inspección y reutilización. La model card no incluye detalles sobre arquitectura interna, datos de entrenamiento ni benchmarks, por lo que esta ficha se limita a los datos verificables del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de predicción de estructura proteica basado en la familia ESM; detalles no publicados en la model card) |
| Parámetros totales | 225.753.308 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | MIT (Copyright 2026 Chan Zuckerberg Biohub, Inc.) |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

No se han publicado en la información disponible detalles sobre la arquitectura interna (tipo de transformer, mecanismos de atención, número de capas o dimensión oculta), ni sobre el volumen o composición del dataset de entrenamiento, ni sobre si se emplearon técnicas de alineación como RLHF o DPO. La model card original se limita a indicar que ESMFold2 predice estructuras 3D all-atom de alta resolución a partir de secuencia única o de MSA, con mejora de precisión en objetivos difíciles.

La única información técnica verificable del repositorio es el recuento de parámetros (225.753.308) obtenido directamente de los safetensors, el tamaño del repositorio (0,9 GB) y la integridad byte-a-byte respecto al commit original `61717221f7546753c1fdd5366ae507fe3a40d10f`, con hashes SHA-256 publicados tanto para `model.safetensors` como para `config.json`. Para detalles de arquitectura y entrenamiento debe consultarse el paper y el repositorio de código en GitHub.

## Capacidades

- Predicción de estructura proteica 3D all-atom de alta resolución.
- Predicción condicionada por secuencia única (single-sequence).
- Predicción condicionada por MSA (alineamiento múltiple de secuencias), con mayor precisión en objetivos difíciles.
- Modelado de estructura a nivel de todos los átomos (no solo cadena principal).
- Reproducibilidad científica: pesos y configuración idénticos al commit fuente, verificables por hash.
- Capacidades de tool calling, agentes, visión, audio o thinking mode: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo declara únicamente `en` como idioma, aunque su dominio de aplicación es biológico y no lingüístico.

## Casos de uso

- Reproducción de resultados científicos: permite replicar los experimentos del paper "Language Modeling Materializes a World Model of Protein Biology" usando pesos byte-idénticos a los del commit original, con verificación por SHA-256.
- Auditoría de procedencia: investigadores pueden comprobar que los artefactos del espejo coinciden con la fuente oficial antes de incluirlos en pipelines de evaluación.
- Predicción de estructura para objetivos difíciles: el modo condicionado por MSA mejora la precisión en proteínas con homología remota, útil en anotación funcional de genomas.
- Análisis estructural all-atom: permite estudiar cadenas laterales y contactos atómicos finos, relevante para diseño de fármacos y estudio de sitios activos.
- Predicción a partir de secuencia única: útil cuando no existe un MSA fiable disponible, por ejemplo en proteínas huérfanas o de novo.
- Docencia y formación: servir como material de referencia reproducible en cursos de biología computacional y aprendizaje profundo aplicado a estructura de proteínas.
- Integración en pipelines de biología estructural: uso como componente de evaluación en flujos que comparan predictores de estructura, dado su licencia MIT y formato safetensors estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como GDT-TS, TM-score, lDDT, RMSD ni comparaciones cuantitativas con otros predictores. Cualquier cifra de rendimiento debe obtenerse del paper o del repositorio de código, no de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 225,7 millones de parámetros en precisión completa (fp32) los pesos ocuparían aproximadamente 0,9 GB, aunque el pico de memoria durante la inferencia depende de la longitud de la secuencia y del modo (secuencia única o MSA), datos no publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño de pesos sugiere que cabría en GPUs de consumo, pero no hay confirmación oficial.
- Opciones de despliegue: no disponible; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El código de referencia está en `github.com/Biohub/esm`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos (por ejemplo AlphaFold2, ESMFold original u otros predictores) que permitan una comparación rigurosa. La única comparación documentada es interna: el autor recomienda usar `biohub/ESMFold2` para investigación en lugar de esta variante experimental.

## Limitaciones y advertencias

- Es un espejo de procedencia: no debe usarse como modelo principal; el autor indica explícitamente que para trabajo de investigación se utilice `biohub/ESMFold2`.
- Variante experimental: los pesos corresponden a una release experimental vinculada a reproducibilidad, no a un modelo validado para producción.
- Sin datos de benchmarks: no hay métricas publicadas en la model card que permitan estimar precisión o robustez.
- Sesgos conocidos: no disponibles en la información proporcionada; en modelos de estructura proteica los sesgos suelen reflejar la composición del dataset de entrenamiento (PDB), pero no se documenta aquí.
- Riesgo de alucinación estructural: no cuantificado; al ser un predictor de estructura, puede generar conformaciones plausibles pero incorrectas en regiones de baja cobertura o objetivos difíciles, extremo no verificado en esta ficha.
- Limitaciones de idioma: el modelo declara solo `en`; su dominio es biológico, no lingüístico.
- Restricciones de licencia: MIT permite uso comercial, pero al ser un espejo no modificado, conviene revisar la licencia y condiciones del modelo fuente `biohub/ESMFold2` antes de explotación comercial.
- Cero descargas y cero likes en el momento de la consulta: indica nula validación por parte de la comunidad en este repositorio.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/bviggiano/ESMFold2-Experimental
- Modelo fuente: https://huggingface.co/biohub/ESMFold2-Experimental
- Commit fuente: https://huggingface.co/biohub/ESMFold2-Experimental/tree/61717221f7546753c1fdd5366ae507fe3a40d10f
- Modelo recomendado para investigación: https://huggingface.co/biohub/ESMFold2
- Código: https://github.com/Biohub/esm
- Licencia del código: https://github.com/Biohub/esm/blob/main/LICENSE.md
- Paper (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.06.03.729735
- PDF del paper: https://biohub.ai/papers/esm_protein.pdf
