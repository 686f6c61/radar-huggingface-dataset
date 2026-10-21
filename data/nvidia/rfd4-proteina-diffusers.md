# nvidia/RFD4-Proteina-Diffusers

## Resumen

RFD4-Proteína es un modelo de diseño biomolecular desarrollado por NVIDIA GenAIR en colaboración con el Baker Lab. No es un modelo de lenguaje: genera de forma conjunta secuencias de proteínas y estructuras de todos los átomos (*all-atom*) condicionadas por el contexto molecular que se desea conservar, como una diana de unión, un motivo enzimático, un ligando o determinadas características estructurales. La versión de este repositorio es la publicación para Diffusers de `nvidia/RFD4-Proteina`, con los mismos pesos EMA y una pipeline `RFD4ProteinaPipeline` que no requiere el paquete nativo RFD4 en tiempo de ejecución.

El modelo emplea *flow matching* con un transformer y un autoencoder, y trabaja sobre estructuras CIF anotadas preparadas con `rfd4-proteina-prep`. La salida son coordenadas Atom37 y la identidad de los residuos, que se escriben de vuelta a CIF anotado. Esta versión incorpora un vocabulario de 147 clases de residuos y un espacio latente de 32 dimensiones, fruto de un *fine-tune* LoRA del modelo base fusionado en los pesos.

Es relevante porque unifica el diseño de secuencia y estructura en un solo modelo, algo que tradicionalmente se abordaba con herramientas separadas, y porque su integración en Diffusers facilita la reproducibilidad y el despliegue. El repositorio declara 435,6 millones de parámetros para los pesos EMA, aunque la suma de tensores safetensors del repositorio es de 178.448.304; conviene verificar esta discrepancia antes de dimensionar infraestructura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | *Flow matching* con transformer y autoencoder (VAE); generación conjunta de secuencia y estructura *all-atom* |
| Parámetros totales | 435,6 millones según la model card (pesos EMA); 178.448.304 según los tensores safetensors del repositorio. La discrepancia no se explica en la información disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una estructura CIF anotada, no una secuencia de texto |
| Tipos de cuantización | BF16 en ejecución; pesos almacenados en FP32. La documentación del pipeline menciona cuantización, pero no se enumeran tipos |
| Idiomas soportados | `en` (metadatos). No es una tarea lingüística; no aplica generación multilingüe |
| Licencia | BSD 3-Clause |
| Formato de pesos | safetensors (Diffusers); pesos en FP32; adaptador LoRA en formato Diffusers en la rama `pretrain-base` |
| Pipeline | `RFD4ProteinaPipeline`: `transformer` + `vae` + `RFD4ProteinaScheduler` de backbone y local-latent. El campo pipeline de HuggingFace no está disponible |
| Vocabulario de residuos | 147 clases |
| Espacio
