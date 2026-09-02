# deeprcurs/MBG-N1.0-Hybrid

## Resumen

MBG-N1.0-Hybrid (Model Bahasa Garuda, línea rev-4) es un modelo de lenguaje experimental desarrollado por deepRcurs Labs, actualmente en fase de construcción. Su objetivo es explorar una arquitectura híbrida que combina bloques Mamba-2/SSD con atención MLA (multi-head latent attention), integrando además mezcla de expertos (MoE) con pesos ternarios, Mixture-of-Depths, predicción multi-token y un controlador de razonamiento denominado Trinity-Mirror. El proyecto se presenta como una investigación para capacidades agénticas, de investigación y de código, con un diseño explícitamente auditable, no como un chatbot de uso general.

El repositorio actual no publica pesos del modelo; solo se ha alcanzado el hito de validación G0, que compara un prototipo de 18,28 millones de parámetros contra la línea base rev-3 de 16,75 millones. Los resultados preliminares muestran una mejora significativa en pérdida y perplejidad, así como un escalado casi lineal en la atención gracias a la componente SSD. La licencia es dual personalizada (source-available), no open-source, con restricciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omni-Sparse Hybrid: Mamba-2/SSD + MLA + MoE ternario + Mixture-of-Depths + MTP |
| Parametros totales | No disponible (prototipo de validación: 18,28M; modelo final sin publicar) |
| Parametros activos | No disponible (MoE con shared expert, sin cifras finales) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternario {−1,0,+1} en capas FFN del MoE (durante entrenamiento) |
| Idiomas soportados | No disponible (el nombre sugiere indonesio, pero no se especifica) |
| Licencia | Dual personalizada (source-available); uso comercial requiere permiso escrito del autor |
| Formato de pesos | No publicado (se planea safetensors y checkpoints bf16 .pt) |

## Arquitectura y entrenamiento

La arquitectura de MBG-N1.0-Hybrid es un diseño híbrido intercalado que combina bloques de Mamba-2 (state space duality, SSD) con bloques de atención MLA (multi-head latent attention, estilo DeepSeek). Sobre esta base se aplica una mezcla de expertos de grano fino con enrutamiento por sesgo sin pérdida auxiliar y un experto compartido. Las capas FFN del MoE utilizan pesos ternarios (−1, 0, +1) siguiendo un enfoque de entrenamiento consciente de cuantización tipo BitNet. Además, incorpora Mixture-of-Depths para el cómputo dinámico y cabezas de predicción multi-token (MTP) orientadas a futura decodificación especulativa. El controlador de razonamiento Trinity-Mirror gestiona el flujo de cómputo. El optimizador empleado es GUM (GaLore + Muon), diseñado para reducir el uso de memoria.

El entrenamiento se realiza desde cero, según la model card. El hito G0 validó los primitivos híbridos a 17M de parámetros, comparando contra la línea base rev-3 (GPT-MoE) bajo la misma receta: mismo corpus, mismo BPE, mismo GUM y 150 pasos con semilla 0. Los resultados de validación indican una pérdida de 4,88 y perplejidad de 132 frente a 6,35 y 570 de la línea base, así como un escalado de forward de 7,5× a 2,8× al pasar de T=128 a T=512, evidenciando la ventaja de la componente SSD. No se han publicado detalles sobre el dataset de entrenamiento final, aunque se referencia un repositorio de datos (`deeprcurs/MBG-1.0-data`).

## Capacidades

- Generación de texto autoregresiva (pipeline text-generation).
- Razonamiento multi-paso y control de razonamiento explícito mediante el controlador Trinity-Mirror.
- Soporte de predicción multi-token (MTP) para futura decodificación especulativa.
- Cómputo dinámico mediante Mixture-of-Depths, permitiendo asignar recursos según la dificultad del token.
- Mezcla de expertos con enrutamiento por sesgo sin pérdida auxiliar y experto compartido.
- Pesos ternarios en las FFN del MoE, lo que podría reducir el coste de inferencia y memoria en despliegues posteriores.
- Arquitectura híbrida que combina atención lineal (SSD) con atención latente (MLA), buscando un equilibrio entre eficiencia y calidad.
- No se han publicado capacidades específicas de tool calling, agentes o multimodalidad; el proyecto se enfoca en investigación y código.

## Casos de uso

Dado que el modelo no tiene pesos publicados ni está listo para producción, los casos de uso son prospectivos y dependen de la finalización del entrenamiento:

- Investigación en arquitecturas híbridas: el diseño Omni-Sparse Hybrid sirve como banco de pruebas para comparar Mamba-2/SSD frente a atención clásica, y para validar el impacto de pesos ternarios en modelos MoE.
- Desarrollo de agentes de razonamiento: el controlador Trinity-Mirror y la capacidad de razonamiento multi-paso podrían permitir sistemas agénticos con trazabilidad de decisiones.
- Generación de código asistida: el enfoque en capacidades de código sugiere que podría usarse en editores inteligentes o pipelines de autocompletado, una vez entrenado.
- Evaluación de técnicas de eficiencia: la combinación de SSD, MoE ternario y Mixture-of-Depths permite estudiar el equilibrio entre coste computacional y calidad.
- Prototipado de decodificación especulativa: las cabezas MTP están diseñadas para acelerar la inferencia, lo que podría aplicarse en entornos con restricciones de latencia.
- Formación en modelos de lenguaje eficientes: el proyecto incluye código fuente y reportes, útil para investigadores que quieran reproducir o aprender de estas técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento corresponde al hito de validación G0, que compara el prototipo rev-4 (18,28M) con la línea base rev-3 (16,75M) bajo condiciones idénticas:

| Metrica | rev-3 baseline (16,75M) | rev-4 hybrid (18,28M) |
|---|---|---|
| Val loss | 6,35 | 4,88 (−23%) |
| Val PPL | 570 | 132 (−77%) |
| Escalado forward T=128→512 | 7,5× (atención cuadrática) | 2,8× (SSD casi lineal) |

Estos resultados son preliminares y corresponden a un prototipo de validación, no al modelo final.

## Requisitos de hardware

- No disponible: el modelo no tiene pesos publicados, por lo que no se puede estimar VRAM ni latencia real.
- El prototipo de validación (18,28M parámetros) cabría en cualquier GPU moderna, incluso en CPU, pero no es representativo del modelo final.
- No se han especificado GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.).
- Se espera que la arquitectura híbrida y los pesos ternarios reduzcan los requisitos de memoria y cómputo en comparación con modelos densos del mismo tamaño, pero esto es especulativo hasta que se publiquen pesos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El modelo está en fase de investigación, sin pesos publicados ni benchmarks estándar. No se conocen alternativas directas con la misma combinación de arquitecturas (Mamba-2 + MLA + MoE ternario). Se recomienda esperar a la publicación de pesos y evaluaciones formales.

## Limitaciones y advertencias

- El modelo no tiene pesos publicados; el repositorio está en estado "UNDER CONSTRUCTION". Cualquier uso en producción es imposible actualmente.
- La licencia es dual personalizada y no es open-source. El uso comercial, el re-branding o la redistribución derivada requieren permiso escrito del autor, y pueden aplicarse tasas.
- No se han documentado sesgos ni comportamientos alucinatorios, pero al ser un modelo pequeño y sin entrenamiento completo, es previsible que presente errores y falta de cobertura en muchos dominios.
- No se especifican idiomas soportados; el nombre sugiere orientación al indonesio, pero no hay confirmación.
- Los resultados de validación G0 son de un prototipo de 18M parámetros, no del modelo final; no deben extrapolarse.
- La arquitectura combina múltiples técnicas experimentales (ternario, MoD, MTP, Trinity-Mirror) que pueden introducir inestabilidades o comportamientos imprevistos.
- No hay garantía de que el proyecto llegue a publicar pesos completos; el autor puede abandonarlo o cambiar de dirección.

## Enlaces

- Repositorio del modelo: https://huggingface.co/deeprcurs/MBG-N1.0-Hybrid
- Dataset de entrenamiento/evaluación: https://huggingface.co/datasets/deeprcurs/MBG-1.0-data
- Organización deepRcurs Labs: https://huggingface.co/deeprcurs/models
- Línea base rev-3 (archivo congelado): https://huggingface.co/deeprcurs/MBG-1.0
