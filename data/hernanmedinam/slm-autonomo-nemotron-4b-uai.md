# hernanmedinam/slm-autonomo-nemotron-4b-uai

## Resumen
SLM Autónomo Nemotron 4B - UAI es un modelo derivado de `nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1`, publicado por Hernán Medina M. en el contexto de un taller del Magíster en Inteligencia Artificial de la Universidad Adolfo Ibáñez (2026). Es un decoder-only Transformer de la familia Llama/Nemotron, ajustado con QLoRA 4-bit y LoRA para responder en español sobre contenidos de fundamentos de LLM, RAG, destilación y LLMOps. El repositorio declara 4.512.746.496 parámetros en safetensors, aunque la model card indica 2.680.884.224 parámetros totales observados por el proyecto; la discrepancia no se explica.

El artefacto corresponde al mejor checkpoint (ronda 3) de un ciclo de aprendizaje autónomo en el que un currículo adaptativo, un modelo OpenAI como profesor, otro como juez y un orquestador que promueve o revierte checkpoints guiaron el ajuste local. La evaluación es una métrica interna de 8 preguntas, no un benchmark general: la nota media fue 4,38/10, con una mejora de +2,38 puntos frente al baseline. Es relevante como caso reproducible de ajuste autónomo de
