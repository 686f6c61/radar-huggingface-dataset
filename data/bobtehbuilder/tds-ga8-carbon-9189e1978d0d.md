# bobtehbuilder/tds-ga8-carbon-9189e1978d0d

## Resumen

El repositorio `bobtehbuilder/tds-ga8-carbon-9189e1978d0d` no contiene un modelo de inteligencia artificial, sino una *model card* de contabilidad de carbono asociada al entrenamiento de un modelo denominado "TDS GA8". El autor, `bobtehbuilder`, publica únicamente los metadatos de emisiones de CO₂ equivalente generadas durante un proceso de *pre-training*, medidos con la herramienta CodeCarbon.

La ficha reporta un total de 314,694 kg de CO₂eq emitidos, calculados a partir de 168,3 horas de uso de 8 GPU NVIDIA L40S en la región us-east1 de Google Cloud, con un PUE de 1,59 y una intensidad de red de 420 gCO₂eq/kWh. No se incluye ningún peso, arquitectura, dataset ni código de inferencia en el repositorio.

Este tipo de publicaciones se enmarcan en la tendencia de "Green AI" y transparencia ambiental en el entrenamiento de modelos, pero desde el punto de vista técnico no aporta ningún artefacto utilizable para desarrolladores o investigadores. Es relevante únicamente como registro de huella de carbono de un entrenamiento del que no se documenta ningún otro detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos) |

## Arquitectura y entrenamiento

No se proporciona información alguna sobre la arquitectura del modelo TDS GA8. La única información de entrenamiento disponible es la relativa al consumo energético y las emisiones: se emplearon 8 GPU NVIDIA L40S (350 W TDP) durante 168,3 horas, con un PUE de 1,59, en la región `us-east1` (intensidad de red de 420 gCO₂eq/kWh). El tipo de entrenamiento se declara como `pre-training`. No se documenta el número de tokens, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se declara ninguna capacidad funcional del modelo:

- Generación de texto, razonamiento, código o matemáticas: no disponible
- Soporte de tool calling o function calling: no disponible
- Soporte de agentes o razonamiento multi-paso: no disponible
- Capacidades multilingües: no disponibles
- Capacidades especiales (thinking mode, visión, audio): no disponibles

## Casos de uso

No es posible proponer casos de uso prácticos con este repositorio, ya que no contiene un modelo ejecutable ni pesos descargables. Los únicos datos aportados son las emisiones de carbono del entrenamiento, que podrían servir para:

- Auditoría ambiental de entrenamiento: el dato de 314,694 kg CO₂eq puede usarse como referencia de huella de carbono para comparar con otros entrenamientos de modelos similares, si se conociera el tamaño del modelo, dato que no se aporta.
- Documentación de conformidad ESG: las empresas podrían citar esta tarjeta en informes de sostenibilidad, aunque sin conocer el modelo subyacente su valor es limitado.
- Estudio metodológico de Codecarbon: puede servir como ejemplo de cómo se calculan las emisiones con la fórmula `energy_kWh = TDP x GPUs x hours x PUE / 1000` y `co2_kg = energy_kWh x grid_intensity / 1000`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se puede estimar VRAM, latencia o throughput porque no hay pesos ni arquitectura. El único dato de hardware es el usado en el entrenamiento:

- 8 GPU NVIDIA L40S (350 W TDP) durante 168,3 horas
- No se indica si el modelo cabe en GPU de consumo
- No se documentan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.)

## Comparativa con modelos similares

No disponible. Al no existir información sobre arquitectura, parámetros o rendimiento, no es posible comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene ningún artefacto de modelo (pesos, tokenizador, config), solo una tarjeta de emisiones.
- No se indica el tamaño del modelo, por lo que la métrica de emisiones (314,69 kg CO₂eq) no puede contextualizarse ni compararse con otros entrenamientos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto o idioma porque no hay modelo.
- La licencia no está definida, lo que impide conocer si el contenido del repositorio puede reutilizarse.
- La fecha de creación (2026-08-23) y el nombre "TDS GA8" sugieren que podría tratarse de un experimento de contabilidad de carbono, pero no hay evidencia de que el modelo TDS esté publicado en otro lugar.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/bobtehbuilder/tds-ga8-carbon-9189e1978d0d
- Otros repositorios del mismo autor con tarjetas similares: https://huggingface.co/bobtehbuilder/tds-ga8-carbon-f5ad34f6f655, https://huggingface.co/bobtehbuilder/tds-ga8-carbon-f29a6f980e7e, https://huggingface.co/bobtehbuilder/tds-ga8-carbon-9fc82fc7f449, https://huggingface.co/bobtehbuilder/tds-ga8-carbon-032aeb8b8896, https://huggingface.co/bobtehbuilder/tds-ga8-carbon-6a8e6dfb92fb
